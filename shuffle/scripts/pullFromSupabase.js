require("dotenv").load();

const { createClient } = require("@supabase/supabase-js");
const { Pool } = require("pg");
const supabase = createClient("your-supabase-url", "your-supabase-key");

const connectionString = process.env.POSTGRES_PRISMA_URL;

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

    for (const poll of polls) {
      await pool.query("INSERT INTO polls VALUES($1, $2, $3, $4, $5, $6, $7)", [
        poll.id,
        poll.polis_id,
        poll.title,
        poll.core_question,
        poll.created_at,
        poll.user_id,
        poll.analytics_filters,
      ]);

      for (const comment of poll.comments) {
        await pool.query(
          "INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [
            comment.id,
            comment.poll_id,
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
            "INSERT INTO flagged_comments VALUES($1, $2, $3, $4, $5, $6)",
            [
              flaggedComment.id,
              flaggedComment.comment_id,
              flaggedComment.session_id,
              flaggedComment.reason,
              flaggedComment.created_at,
              flaggedComment.user_id,
            ]
          );
        }

        for (const response of comment.responses) {
          await pool.query(
            "INSERT INTO responses VALUES($1, $2, $3, $4, $5, $6)",
            [
              response.id,
              response.user_id,
              response.comment_id,
              response.session_id,
              response.valence,
              response.created_at,
            ]
          );
        }
      }
    }

    console.log("Data has been written to the local Postgres database.");
  } catch (error) {
    console.error("Error fetching or writing data:", error);
  }
}

fetchData();
