const { createClient } = require("@supabase/supabase-js");
const { Pool } = require("pg");

const supabase = createClient(
  "https://yrehugaawjzlqnkoodru.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZWh1Z2Fhd2p6bHFua29vZHJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MjY3MTg1NiwiZXhwIjoxOTk4MjQ3ODU2fQ.pHSKIWWzQeK8JkiBIgnq1J9huDbvq2Qq_CI5FUghznw"
);

const connectionString =
  "postgres://viewpoints:viewpoints@localhost:5432/viewpoints_development";

const pool = new Pool({
  connectionString,
});

async function fetchData() {
  try {
    const { data: polls, error: pollsError } = await supabase
      .from("polls")
      .select("*");

    if (pollsError) throw pollsError;

    for (const poll of polls) {
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("poll_id", poll.id);

      if (commentsError) throw commentsError;

      poll.comments = comments;

      for (const comment of comments) {
        const { data: flaggedComments, error: flaggedCommentsError } =
          await supabase
            .from("flagged_comments")
            .select("*")
            .eq("comment_id", comment.id);

        if (flaggedCommentsError) throw flaggedCommentsError;

        comment.flagged_comments = flaggedComments;

        const { data: responses, error: responsesError } = await supabase
          .from("responses")
          .select("*")
          .eq("comment_id", comment.id);

        if (responsesError) throw responsesError;

        comment.responses = responses;
      }
    }

    await pool.query("BEGIN");

    try {
      for (const poll of polls) {
        const row = await pool.query(
          "INSERT INTO polls (user_id,slug,title,core_question,created_at,analytics_filters) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [
            poll.user_id,
            poll.polis_id,
            poll.title,
            poll.core_question,
            poll.created_at,
            poll.analytics_filters ?? "{}",
          ]
        );

        const { id: pollId } = row;
        console.log(row);

        for (const comment of poll.comments) {
          const { id: commentId } = await pool.query(
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
            ]
          );

          for (const flaggedComment of comment.flagged_comments) {
            await pool.query(
              "INSERT INTO flagged_comments (comment_id,user_id,session_id,reason,created_at) VALUES ($1, $2, $3, $4, $5)",
              [
                commentId,
                flaggedComment.user_id,
                flaggedComment.session_id,
                flaggedComment.reason,
                flaggedComment.created_at,
              ]
            );
          }

          for (const response of comment.responses) {
            await pool.query(
              "INSERT INTO responses (user_id,comment_id,session_id,valence,created_at) VALUES ($1, $2, $3, $4, $5)",
              [
                response.user_id,
                commentId,
                response.session_id,
                response.valence,
                response.created_at,
              ]
            );
          }
        }
      }
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    } finally {
      await pool.query("COMMIT");
    }

    console.log("Data has been written to the local Postgres database.");
  } catch (error) {
    console.error("Error fetching or writing data:", error);
  }
}

fetchData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
