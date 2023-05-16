import { Comment, Response } from "@/lib/api";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useMemo } from "react";
import { useQuery } from "react-query";

// Config
// -----------------------------------------------------------------------------

enum GraphType {
  BackgroundBar,
  PerUserHeatmap,
  TotalHeatmap,
  ClustersKModes,
  ClustersCosineDistance,
  PolisMatrix,
}

const GRAPH_TYPE = GraphType.ClustersCosineDistance;

// Background bars
// -----------------------------------------------------------------------------

const BackgroundBar = ({ responses }: { responses: Response[] }) => {
  //   // Calculate the difference from the mean for each user and project users onto a single x-axis
  //   const usersDifferenceFromMean: { [userId: string]: number } = {};

  //   (responses ?? []).forEach((response) => {
  //     const responseValue = valenceToNumber(response.valence);
  //     const differenceFromMean = responseValue - meanResponseValue;
  //     usersDifferenceFromMean[response.user_id ?? response.session_id] =
  //       differenceFromMean;
  //   });

  //   // Calculate the standard deviation
  //   const standardDeviation = Math.sqrt(
  //     Object.values(usersDifferenceFromMean).reduce(
  //       (sum, differenceFromMean) => sum + differenceFromMean ** 2,
  //       0
  //     ) / (responses ?? []).length
  //   );

  //   const usersDifferenceFromMeanArray = Object.entries(
  //     usersDifferenceFromMean
  //   ).map(([userId, difference]) => ({
  //     userId,
  //     difference,
  //   }));

  //   const maxDifference = Math.max(
  //     ...usersDifferenceFromMeanArray.map((item) => Math.abs(item.difference))
  //   );

  return (
    <div
      style={{
        display: "flex",
        height: "200px",
        alignItems: "end",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {responses.map((item, index) => {
        let height = 0;
        let top = 0;
        if (item.valence === "agree") {
          top = -100;
          height = 50;
        } else if (item.valence === "disagree") {
          height = 50;
        } else if (item.valence === "skip") {
          height = 0;
        } else if (item.valence === "itsComplicated") {
          height = 100;
        }

        return (
          <div
            key={index}
            className="flex items-center justify-center bg-gray-200 basis-5 w-[20px] min-w-[20px] relative text-gray-300"
            style={{
              height: `${height}%`,
              top,
            }}
          >
            {item.valence === "agree"
              ? "A"
              : item.valence === "disagree"
              ? "D"
              : item.valence === "skip"
              ? "S"
              : item.valence === "itsComplicated"
              ? "?"
              : null}
          </div>
        );
      })}
    </div>
  );
};

// Heatmaps
// -----------------------------------------------------------------------------

const valenceToColor = (valence: Response["valence"]): string => {
  switch (valence) {
    case "agree":
      return "green";
    case "disagree":
      return "red";
    case "skip":
      return "gray";
    case "itsComplicated":
      return "orange";
  }
};

const valenceToNumber = (valence: Response["valence"]): number => {
  switch (valence) {
    case "agree":
      return 1;
    case "disagree":
      return -1;
    case "skip":
      return 0;
    case "itsComplicated":
      return 0.5;
  }
};

const PerUserHeatmap: React.FC<{ responses: Response[] }> = ({ responses }) => {
  const totalResponseValue = (responses ?? []).reduce(
    (sum, response) => sum + valenceToNumber(response.valence),
    0
  );

  const meanResponseValue = totalResponseValue / (responses ?? []).length;

  const grid = responses.reduce((acc, cur) => {
    if (!acc[cur.user_id ?? cur.session_id])
      acc[cur.user_id ?? cur.session_id] = {};
    acc[cur.user_id ?? cur.session_id][cur.comment_id] = cur.valence;
    return acc;
  }, {} as { [userId: string]: { [commentId: string]: Response["valence"] } });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "start" }}
    >
      {Object.entries(grid).map(([userId, comments]) => (
        <div key={userId} style={{ display: "flex", flexDirection: "row" }}>
          {Object.entries(comments).map(([commentId, valence]) => (
            <div
              key={commentId}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: valenceToColor(valence as Response["valence"]),
                border: "1px solid black",
                margin: "2px",
                opacity:
                  Math.abs(
                    valenceToNumber(valence as Response["valence"]) -
                      meanResponseValue
                  ) /
                    2 +
                  0.5,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const TotalHeatmap: React.FC<{ responses: Response[] }> = ({ responses }) => {
  const totalResponseValue = (responses ?? []).reduce(
    (sum, response) => sum + valenceToNumber(response.valence),
    0
  );

  const meanResponseValue = totalResponseValue / (responses ?? []).length;

  const sortedResponses = responses.sort((a, b) =>
    valenceToNumber(a.valence) > valenceToNumber(b.valence) ? 1 : -1
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "start",
        width: "50%",
      }}
    >
      {sortedResponses.map((response) => (
        <div
          key={response.id}
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: valenceToColor(
              response.valence as Response["valence"]
            ),
            border: "1px solid black",
            margin: "2px",
            opacity:
              Math.abs(
                valenceToNumber(response.valence as Response["valence"]) -
                  meanResponseValue
              ) /
                2 +
              0.5,
          }}
        />
      ))}
    </div>
  );
};

// Clusters (Simple k-modes)
// -----------------------------------------------------------------------------

const k = 3; // Number of clusters
const maxIterations = 100; // Maximum number of iterations

const kModes = (responses: Response[]) => {
  const data = responses.map((response) => ({
    userId: response.user_id ?? response.session_id,
    value: response.valence,
  }));

  // Initialize modes randomly
  let modes = data
    .sort(() => 0.5 - Math.random())
    .slice(0, k)
    .map((response) => response.value as string);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign each data point to the nearest mode
    const clusters = data.reduce((clusters, response) => {
      const modeIndex = modes.reduce(
        (nearestIndex, mode, index) =>
          response.value === mode ? index : nearestIndex,
        0
      );

      clusters[modeIndex].push(response);
      return clusters;
    }, Array.from({ length: k }, () => []) as (typeof data)[]);

    // Calculate the new mode of each cluster
    const newModes = clusters.map((cluster) => {
      const modeCount = cluster.reduce((count, response) => {
        count[response.value] = (count[response.value] || 0) + 1;
        return count;
      }, {} as { [valence: string]: number });

      return Object.keys(modeCount).reduce((a, b) =>
        modeCount[a] > modeCount[b] ? a : b
      );
    });

    // Check if modes have changed
    const modesChanged = newModes.some((mode, index) => mode !== modes[index]);

    // Update modes
    modes = newModes;

    // If modes haven't changed, we're done
    if (!modesChanged) {
      break;
    }
  }

  const clusters: { userId: string; value: string }[][] = Array.from(
    { length: k },
    () => []
  );

  for (let response of data) {
    const modeIndex = modes.findIndex((mode) => mode === response.value);
    if (!clusters[modeIndex]) {
      clusters[modeIndex] = [];
    }
    clusters[modeIndex].push(response);
  }

  return clusters;
};

const ClustersKModes = ({ responses }: { responses: Response[] }) => {
  const colors = ["red", "green", "blue"]; // Colors for clusters
  const clusters = useMemo(() => kModes(responses), [responses]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {clusters.map((cluster, index) => (
        <div key={index} style={{ margin: "10px" }}>
          <h2 style={{ color: colors[index] }}>Cluster {index + 1}</h2>
          {cluster.map((response) => (
            <div key={response.userId}>
              {response.userId}: {response.value}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Polis Matrix
// -----------------------------------------------------------------------------

// I've had a think about how to do the Polis opinion matrix clustering (or, at
// least, do something similar) and I've arrived at the following.
//
// First, we need an opinion matrix, which is an NxM matrix where N is the number
// of users and M is the number of comments. Each cell in the matrix is the
// valence of the user's response to the comment. For example, if there are 3
// users and 4 comments, the matrix might look like this:
//
//   | C1 | C2 | C3 | C4 |
// U1|  A |  D |  S |  ? |
// U2|  D |  D |  A |  A |
// U3|  A |  A |  A |  D |
//
// We'll convert the valences to numbers using the following table:
//
//   A:  1
//   D: -1
//   S:  0
//   ?:  0.2
//
// Since it's a sparse matrix (i.e. not every user has responded to every
// comment), we'll also need a 'none' value. Let's stipulate that the 'none'
// value is 0 (i.e. the same as 'skip').

const numericalValence = (valence: Response["valence"] | "none"): number => {
  switch (valence) {
    case "agree":
      return 1;
    case "disagree":
      return -1;
    case "itsComplicated":
      return 0.2;
    default:
      return 0;
  }
};

// Let's first build up our opinion matrix from the responses:

const getCommentIds = (responses: Response[]) => [
  ...responses
    .map((response) => response.comment_id)
    .filter((commentId, index, array) => array.indexOf(commentId) === index),
];

const getUserIds = (responses: Response[]) => [
  ...responses
    .map((response) => response.user_id ?? response.session_id)
    .filter((commentId, index, array) => array.indexOf(commentId) === index),
];

const getOpinionMatrix = (responses: Response[]) => {
  const commentIds = getCommentIds(responses);
  const userIds = getUserIds(responses);

  const opinionMatrix = Array(userIds.length)
    .fill(null)
    .map(() => Array(commentIds.length).fill(numericalValence("none")));

  responses.forEach((response) => {
    const userIndex = userIds.indexOf(response.user_id ?? response.session_id);
    const commentIndex = commentIds.indexOf(response.comment_id);
    opinionMatrix[userIndex][commentIndex] = numericalValence(response.valence);
  });

  return opinionMatrix;
};

// Next up, we want to get a measure of similarity between users. For this, we can
// use the cosine distance. The cosine distance is a measure of the angle
// between two vectors:
//
// * If the angle is 0, the vectors are identical.
// * If the angle is 90, the vectors are orthogonal (i.e. they have no similarity).
// * If the angle is 180, the vectors are opposite (i.e. they are as dissimilar as possible).
//
// We can calculate the cosine distance using the following formula:
//
//  cos(theta) = (a . b) / (|a| * |b|)
//
// Where:
//
// * a . b is the dot product of a and b
// * |a| is the magnitude of a
// * |b| is the magnitude of b
//
// Since we're getting the cosine of the angle, our results will look like:
//
// * If the angle is 0, the cosine is 1.
// * If the angle is 90, the cosine is 0.
// * If the angle is 180, the cosine is -1.
//
// This is a useful measure for us for a key reason: it's invariant to the length of the vectors.
// This means that we can compare users who have responded to different numbers of comments.

const dotProduct = (a: number[], b: number[]): number =>
  a.reduce((sum, a, index) => sum + a * b[index], 0);

const magnitude = (a: number[]): number => Math.sqrt(dotProduct(a, a));

const cosineSimilarity = (a: number[], b: number[]): number =>
  dotProduct(a, b) / (magnitude(a) * magnitude(b));

// We then want to calculate the similarity score between each pair of users. We'll store these
// in a matrix, where each cell is the similarity score between the users in the row and column.

const getSimilarityMatrix = (opinionMatrix: number[][]) => {
  const similarityMatrix = Array(opinionMatrix.length).fill(
    Array(opinionMatrix.length).fill(0)
  );

  return opinionMatrix.reduce((similarityMatrix, user, index) => {
    opinionMatrix.forEach((otherUser, otherIndex) => {
      similarityMatrix[index][otherIndex] = cosineSimilarity(user, otherUser);
    });
    return similarityMatrix;
  }, similarityMatrix);
};

// We now have a measure of similarity between each pair of users. We can use this to cluster
// users together. Let's use hierarchical similarity clustering.
//
// Hierarchical similarity clustering gives us a set of clusters, where each cluster is
// distinct from the others, and the objects within each cluster are similar to each other.
//
// The algorithm works like this:
//
// 1. Start with each user in its own cluster.
// 2. Find the most similar pair of clusters.
// 3. Merge the two clusters into a single cluster.
// 4. Repeat steps 2 and 3 until there is only K clusters left.
//
// This does mean that it is O(n^3) in the worst case, but it's not too bad for our purposes.
//
// Our similarity matrix is a matrix of cosine similarities, so we'll be returning an array of
// arrays of user indexes.

const hierarchicalClustering = (
  similarityMatrix: number[][],
  k: number
): number[][] => {
  let clusters = similarityMatrix.map((_, i) => [i]); // start with each row's index (user index) in its own cluster

  while (clusters.length > k) {
    // Find the two clusters that are closest to each other
    let minDistance = Infinity;
    let mergeClusters = [-1, -1];

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let distance =
          clusters[i]
            .map((index1) =>
              clusters[j].map((index2) => similarityMatrix[index1][index2])
            )
            .flat()
            .reduce((a, b) => a + b, 0) /
          (clusters[i].length * clusters[j].length); // average distance between points in the two clusters

        if (distance < minDistance) {
          minDistance = distance;
          mergeClusters = [i, j];
        }
      }
    }

    // Merge the two closest clusters
    clusters[mergeClusters[0]] = clusters[mergeClusters[0]].concat(
      clusters[mergeClusters[1]]
    );
    clusters.splice(mergeClusters[1], 1);
  }

  return clusters;
};

// Now we know how to cluster users, all we need to do now is map back from our clusters to our users and
// their comments.
//
// Our hierarchical clustering algorithm returns an array of clusters of user indexes. We built our initial
// similarity matrix by mapping the user indexes to the rows of the matrix. So, we can map back from the
// clusters to the rows of the matrix, and this should give us our actual user ID.
//
// And we can do the same for the comments!
//
// We can thus take each cluster and transform it into a list of users and their votes on each comment.

const clusterUsers = (similarityMatrix: number[][], responses: Response[]) => {
  const clusters = hierarchicalClustering(similarityMatrix, k);
  const userIds = getUserIds(responses);

  return clusters.map((cluster) => {
    const userIndexedIds = cluster.map((index) => userIds[index]);

    return responses.filter((response) =>
      userIndexedIds.includes(response.user_id ?? response.session_id)
    );
  });
};

// Phew! Now we've got all the logic we need to cluster users. Let's put it all together.
//
// We'll present it in a couple of ways. Firstly, let's list out the clusters:

const ClustersCosineDistance = ({ responses }: { responses: Response[] }) => {
  const opinionMatrix = useMemo(() => getOpinionMatrix(responses), [responses]);
  const similarityMatrix = useMemo(
    () => getSimilarityMatrix(opinionMatrix),
    [opinionMatrix]
  );
  const clusters = useMemo(
    () => clusterUsers(similarityMatrix, responses),
    [responses, similarityMatrix]
  );

  console.log({ responses });
  console.log({ opinionMatrix });
  console.log({ similarityMatrix });
  console.log({ clusters });

  return null;
};

// Default export
// -----------------------------------------------------------------------------

const MeanResponse = ({ commentIds }: { commentIds: Comment["id"][] }) => {
  const { client } = useSupabase();

  const { data: responses, isLoading: responsesLoading } = useQuery(
    ["responses", commentIds.join(",")],
    async () => {
      const { data, error } = await client
        .from("responses")
        .select("*")
        .in("comment_id", commentIds);

      if (error) {
        throw error;
      }

      return data as Response[];
    }
  );

  if (responsesLoading) {
    return <div>loading...</div>;
  }

  if (GRAPH_TYPE === GraphType.BackgroundBar) {
    return <BackgroundBar responses={responses ?? []} />;
  }

  if (GRAPH_TYPE === GraphType.PerUserHeatmap) {
    return <PerUserHeatmap responses={responses ?? []} />;
  }

  if (GRAPH_TYPE === GraphType.TotalHeatmap) {
    return <TotalHeatmap responses={responses ?? []} />;
  }

  if (GRAPH_TYPE === GraphType.ClustersKModes) {
    return <ClustersKModes responses={responses ?? []} />;
  }

  if (GRAPH_TYPE === GraphType.ClustersCosineDistance) {
    return <ClustersCosineDistance responses={responses ?? []} />;
  }

  return null;
};

export default MeanResponse;
