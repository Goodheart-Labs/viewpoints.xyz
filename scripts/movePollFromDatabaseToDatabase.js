const { Pool } = require("pg");

async function fetchData(
  sourceConnectionString,
  destinationConnectionString,
  pollId,
  excludingSessions = [],
) {
  try {
    const sourcePool = new Pool({
      connectionString: sourceConnectionString,
    });

    const destinationPool = new Pool({
      connectionString: destinationConnectionString,
    });

    // Fetch data from the source database.

    const { rows: polls } = await sourcePool.query(
      "SELECT * FROM polls WHERE id = $1",
      [pollId],
    );

    if (polls.length === 0) {
      throw new Error(`Poll with ID ${pollId} not found.`);
    }

    console.log(`Found poll ${pollId} in the source database.`);

    const poll = polls[0];

    const { rows: comments } = await sourcePool.query(
      "SELECT * FROM comments WHERE poll_id = $1",
      [poll.id],
    );

    console.log(`Found ${comments.length} comments in the source database.`);

    const commentIds = comments.map((comment) => Number(comment.id));

    const { rows: flaggedComments } = await sourcePool.query(
      `SELECT * FROM flagged_comments WHERE comment_id IN (${commentIds.join(
        ",",
      )})`,
    );

    console.log(`Found ${flaggedComments.length} flagged comments.`);

    const { rows: responses } = await sourcePool.query(
      `SELECT * FROM responses WHERE comment_id IN (${commentIds.join(
        ",",
      )}) AND session_id NOT IN (${excludingSessions
        .map((session) => `'${session}'`)
        .join(",")})`,
    );

    console.log(`Found ${responses.length} responses.`);

    // Let's confirm with the user that they want to move the data.

    console.log(
      `You are about to move ${polls.length} polls, ${comments.length} comments, ${flaggedComments.length} flagged comments, and ${responses.length} responses.`,
    );

    console.log(
      `Comment IDs: ${comments.map((comment) => comment.id).join(", ")}`,
    );

    console.log(
      `Flagged comment IDs: ${flaggedComments
        .map((flaggedComment) => flaggedComment.id)
        .join(", ")}`,
    );

    console.log(
      `Response IDs: ${responses.map((response) => response.id).join(", ")}`,
    );

    console.log(`Are you sure you want to move this data? (y/n)`);

    const response = await new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim());
      });
    });

    if (response !== "y") {
      console.log("Aborting.");
      process.exit(0);
    }

    // Move data to the destination database.

    await destinationPool.query("BEGIN");

    try {
      for (const poll of polls) {
        const pollRow = await destinationPool.query(
          "INSERT INTO polls (user_id,slug,title,core_question,created_at,analytics_filters) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [
            poll.user_id,
            poll.polis_id,
            poll.title,
            poll.core_question,
            poll.created_at,
            poll.analytics_filters ?? "{}",
          ],
        );

        const pollId = pollRow.rows[0].id;

        console.log(
          `Inserted poll ${poll.polis_id} into the destination database.`,
        );

        for (const comment of comments) {
          const commentRow = await destinationPool.query(
            "INSERT INTO comments (poll_id,user_id,edited_from_id,session_id,reporting_type,author_name,author_avatar_url,comment,created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
            [
              pollId,
              comment.user_id,
              comment.edited_from_id,
              comment.session_id,
              comment.reporting_type,
              comment.author_name,
              comment.author_avatar_url,
              comment.comment,
              comment.created_at,
            ],
          );

          const commentId = commentRow.rows[0].id;

          console.log(
            `Inserted comment ${commentId} into the destination database.`,
          );

          const currentFlaggedComments = flaggedComments.filter(
            (flaggedComment) =>
              Number(flaggedComment.comment_id) === Number(comment.id),
          );

          for (const flaggedComment of currentFlaggedComments) {
            const flaggedCommentRow = await destinationPool.query(
              "INSERT INTO flagged_comments (comment_id,user_id,session_id,reason,created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
              [
                commentId,
                flaggedComment.user_id,
                flaggedComment.session_id,
                flaggedComment.reason,
                flaggedComment.created_at,
              ],
            );

            const flaggedCommentId = flaggedCommentRow.rows[0].id;

            console.log(
              `Inserted flagged comment ${flaggedCommentId} into the destination database.`,
            );
          }

          const currentResponses = responses.filter(
            (response) => Number(response.comment_id) === Number(comment.id),
          );

          for (const response of currentResponses) {
            const responseRow = await destinationPool.query(
              "INSERT INTO responses (user_id,comment_id,session_id,valence,created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
              [
                response.user_id,
                commentId,
                response.session_id,
                response.valence,
                response.created_at,
              ],
            );

            const responseId = responseRow.rows[0].id;

            console.log(
              `Inserted response ${responseId} into the destination database.`,
            );
          }
        }
      }
    } catch (error) {
      await destinationPool.query("ROLLBACK");
      throw error;
    } finally {
      await destinationPool.query("COMMIT");
    }

    console.log("Data moved successfully.");
  } catch (error) {
    console.error("Error fetching or writing data:", error);
  }
}

// Get the source and destination database connection strings and the poll ID from the command line.

const sourceConnectionString = process.argv[2];
const destinationConnectionString = process.argv[3];
const pollId = process.argv[4];
const excludingSessions = process.argv[5]?.split(",");

if (!sourceConnectionString || !destinationConnectionString || !pollId) {
  console.error(
    "Usage: node movePollFromDatabaseToDatabase.js <sourceConnectionString> <destinationConnectionString> <pollId> [excludingSessions]",
  );
  process.exit(1);
}

fetchData(
  sourceConnectionString,
  destinationConnectionString,
  pollId,
  excludingSessions,
)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
