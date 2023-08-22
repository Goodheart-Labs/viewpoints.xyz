/* eslint-disable */
import { Fragment, useMemo } from "react";
// Users (Unclustered)
// -----------------------------------------------------------------------------
// We can use the idea of an opinion matrix, plus a projection, to create a
// two-dimensional representation of the users.
import { Scatter } from "react-chartjs-2";

import type { Choice, Response, Statement } from "@/lib/api";
import { TSNE } from "@/lib/tsne";

import "chart.js/auto";

// Config
// -----------------------------------------------------------------------------

export enum GraphType {
  BackgroundBar = "BackgroundBar",
  PerUserHeatmap = "PerUserHeatmap",
  TotalHeatmap = "TotalHeatmap",
  ClustersList = "ClustersList",
  ClusterQuestions = "ClusterQuestions",
  TwoDimensionalGraph = "TwoDimensionalGraph",
}

// Background bars
// -----------------------------------------------------------------------------

const BackgroundBar = ({ responses }: { responses: Response[] }) => (
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
      if (item.choice === "agree") {
        top = -100;
        height = 50;
      } else if (item.choice === "disagree") {
        height = 50;
      } else if (item.choice === "skip") {
        height = 0;
      } else if (item.choice === "itsComplicated") {
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
          {item.choice === "agree"
            ? "A"
            : item.choice === "disagree"
            ? "D"
            : item.choice === "skip"
            ? "S"
            : item.choice === "itsComplicated"
            ? "?"
            : null}
        </div>
      );
    })}
  </div>
);

// Heatmaps
// -----------------------------------------------------------------------------

const choiceToColor = (choice: Response["choice"]): string => {
  switch (choice) {
    case "agree":
      return "green";
    case "disagree":
      return "red";
    case "itsComplicated":
      return "orange";
    default:
      return "gray";
  }
};

const choiceToNumber = (choice: Response["choice"]): number => {
  switch (choice) {
    case "agree":
      return 1;
    case "disagree":
      return -1;
    case "itsComplicated":
      return 0.5;
    default:
      return 0;
  }
};

const PerUserHeatmap: React.FC<{ responses: Response[] }> = ({ responses }) => {
  const totalResponseValue = (responses ?? []).reduce(
    (sum, response) => sum + choiceToNumber(response.choice),
    0,
  );

  const meanResponseValue = totalResponseValue / (responses ?? []).length;

  const grid = responses.reduce(
    (acc, cur) => {
      if (!acc[cur.user_id ?? cur.session_id])
        acc[cur.user_id ?? cur.session_id] = {};
      acc[cur.user_id ?? cur.session_id][cur.statementId] = cur.choice;
      return acc;
    },
    {} as { [userId: string]: { [statementId: string]: Response["choice"] } },
  );

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "start" }}
    >
      {Object.entries(grid).map(([userId, statements]) => (
        <div key={userId} style={{ display: "flex", flexDirection: "row" }}>
          {Object.entries(statements).map(([statementId, choice]) => (
            <div
              key={statementId}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: choiceToColor(choice as Response["choice"]),
                margin: "2px",
                opacity:
                  Math.abs(
                    choiceToNumber(choice as Response["choice"]) -
                      meanResponseValue,
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
    (sum, response) => sum + choiceToNumber(response.choice),
    0,
  );

  const meanResponseValue = totalResponseValue / (responses ?? []).length;

  const sortedResponses = responses.sort((a, b) =>
    choiceToNumber(a.choice) > choiceToNumber(b.choice) ? 1 : -1,
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
            backgroundColor: choiceToColor(
              response.choice as Response["choice"],
            ),
            margin: "2px",
            opacity:
              Math.abs(
                choiceToNumber(response.choice as Response["choice"]) -
                  meanResponseValue,
              ) /
                2 +
              0.5,
          }}
        />
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
// of users and M is the number of statements. Each cell in the matrix is the
// choice of the user's response to the statement. For example, if there are 3
// users and 4 statements, the matrix might look like this:
//
//   | C1 | C2 | C3 | C4 |
// U1|  A |  D |  S |  ? |
// U2|  D |  D |  A |  A |
// U3|  A |  A |  A |  D |
//
// We'll convert the choices to numbers using the following table:
//
//   A:  1
//   D: -1
//   S:  0
//   ?:  0.2
//
// Since it's a sparse matrix (i.e. not every user has responded to every
// statement), we'll also need a 'none' value. Let's stipulate that the 'none'
// value is 0 (i.e. the same as 'skip').

const numericalChoice = (choice: Response["choice"] | "none"): number => {
  switch (choice) {
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

const stringChoice = (numericalChoice: number): Response["choice"] | "none" => {
  switch (numericalChoice) {
    case 1:
      return "agree";
    case -1:
      return "disagree";
    case 0.2:
      return "itsComplicated";
    default:
      return "skip";
  }
};

// Let's first build up our opinion matrix from the responses:

const getStatementIds = (responses: Response[]) => [
  ...responses
    .map((response) => response.statementId)
    .filter(
      (statementId, index, array) => array.indexOf(statementId) === index,
    ),
];

const getUserIds = (responses: Response[]) => [
  ...responses
    .map((response) => response.user_id ?? response.session_id)
    .filter(
      (statementId, index, array) => array.indexOf(statementId) === index,
    ),
];

const getOpinionMatrix = (responses: Response[]) => {
  const statementIds = getStatementIds(responses);
  const userIds = getUserIds(responses);

  const opinionMatrix = Array(userIds.length)
    .fill(null)
    .map(() => Array(statementIds.length).fill(numericalChoice("none")));

  responses.forEach((response) => {
    const userIndex = userIds.indexOf(response.user_id ?? response.session_id);
    const statementIndex = statementIds.indexOf(response.statementId);
    opinionMatrix[userIndex][statementIndex] = numericalChoice(response.choice);
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
// This is a useful measure for us for two key reasons:
//
// 1. It's invariant to the length of the vectors. This means that we can compare
//    users who have responded to different numbers of statements.
//
// 2. We don't care about the magnitude of the vectors, since we have a fixed
//    set of choices. We only care whether the direction of the vectors is the same.
//    (Since two vectors pointing toward the same place represent the same opinion
//    over the same set of statements!)

const dotProduct = (a: number[], b: number[]): number =>
  a.reduce((sum, a, index) => sum + a * b[index], 0);

const magnitude = (a: number[]): number => Math.sqrt(dotProduct(a, a));

const cosineSimilarity = (a: number[], b: number[]): number =>
  dotProduct(a, b) / (magnitude(a) * magnitude(b));

// We then want to calculate the similarity score between each pair of users. We'll store these
// in a matrix, where each cell is the similarity score between the users in the row and column.

const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

const getSimilarityMatrix = (opinionMatrix: number[][]) => {
  const numUsers = opinionMatrix.length;

  const similarityMatrix = deepClone(
    Array(numUsers).fill(Array(numUsers).fill(0)),
  );

  for (let i = 0; i < numUsers; i++) {
    const row = opinionMatrix[i];

    for (let j = 0; j < numUsers; j++) {
      if (i === j) {
        similarityMatrix[i][j] = 1;
      } else {
        similarityMatrix[i][j] = cosineSimilarity(row, opinionMatrix[j]);
      }
    }
  }

  return deepClone(similarityMatrix);
};

// We now have a measure of similarity between each pair of users.
//
// We can use the same measure of similarity - cosine similarity - to cluster users
// using k-means.
//
// The k-means algorithm randomly initializes k points (called centroids) and then
// iteratively:
//
// 1. Assigns each point to the nearest centroid
// 2. Recomputes centroids as the mean of the points in each cluster
//
// The algorithm terminates when the centroids stop changing.

const KMEANS_THRESHOLD = 0.0001;

const kmeans = (
  opinionMatrix: number[][],
  k: number,
  maxIterations = 1000,
): { [clusterIndex: number]: number[] } => {
  let centroids = opinionMatrix
    .slice() // create a copy of the array
    .sort(() => 0.5 - Math.random()) // shuffle array
    .slice(0, k); // pick first k elements

  let iteration = 0;
  let oldCentroids: number[][];
  const clusters: number[] = new Array(opinionMatrix.length).fill(-1);

  do {
    // 2. Assign each point to the nearest centroid
    clusters.fill(-1);
    opinionMatrix.forEach((user, i) => {
      let minDistance = Infinity;
      centroids.forEach((centroid, j) => {
        const distance = cosineSimilarity(user, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusters[i] = j;
        }
      });
    });

    // 3. Recompute centroids as the mean of the points in each cluster
    oldCentroids = centroids;
    centroids = centroids.map((_, j) => {
      const clusterUsers = opinionMatrix.filter((_, i) => clusters[i] === j);

      return clusterUsers
        .reduce(
          (mean, user) => mean.map((value, i) => value + user[i]),
          new Array(clusterUsers[0].length).fill(0),
        )
        .map((value) => value / clusterUsers.length);
    });

    iteration++;
  } while (
    centroids.some(
      (centroid, i) =>
        Math.abs(cosineSimilarity(centroid, oldCentroids[i])) >
        KMEANS_THRESHOLD,
    ) &&
    iteration < maxIterations
  );

  // We've got our clusters as an array of cluster indices, where each index
  // corresponds to a user and each value to a cluster.
  //
  // Let's group them a little more usefully.

  const clusterIndexToUserIndex: { [clusterIndex: number]: number[] } = {};

  clusters.forEach((clusterIndex, userIndex) => {
    if (!clusterIndexToUserIndex[clusterIndex]) {
      clusterIndexToUserIndex[clusterIndex] = [];
    }
    clusterIndexToUserIndex[clusterIndex].push(userIndex);
  });

  return clusterIndexToUserIndex;
};

// Now we know how to cluster users, all we need to do now is map back from our
// clusters to our users and their statements.

type ClusteredStatement = {
  statementId: number;
  choice: string;
};

type ClusteredUser = {
  userIdOrSessionId: string;
  statements: ClusteredStatement[];
};

const clusterUsers = (opinionMatrix: number[][], responses: Response[]) => {
  const clusters = kmeans(opinionMatrix, 2);
  const userIds = getUserIds(responses);
  const statementIds = getStatementIds(responses);

  return Object.keys(clusters)
    .map(Number)
    .map((cluster) =>
      clusters[cluster].map(
        (userIndex): ClusteredUser => ({
          userIdOrSessionId: userIds[userIndex],
          statements: opinionMatrix[userIndex].map(
            (choice, statementIndex): ClusteredStatement => ({
              statementId: statementIds[statementIndex],
              choice: stringChoice(choice),
            }),
          ),
        }),
      ),
    );
};

// Phew! Now we've got all the logic we need to cluster users. Let's put it all together.
//
// We'll present it in a couple of ways. Firstly, let's list out the clusters:

const ClustersList = ({ responses }: { responses: Response[] }) => {
  const opinionMatrix = useMemo(() => getOpinionMatrix(responses), [responses]);

  const clusters = useMemo(
    () => clusterUsers(opinionMatrix, responses),
    [responses, opinionMatrix],
  );

  return (
    <div className="container p-4 mx-auto">
      {clusters.map((cluster, i) => (
        <div key={i} className="p-4 mb-4 bg-white rounded shadow-lg">
          <h2 className="mb-2 text-2xl font-bold">Cluster {i + 1}</h2>
          <ul className="pl-5 list-disc">
            {cluster.map((user) => (
              <li key={user.userIdOrSessionId}>
                User: {user.userIdOrSessionId}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// We can also present the statements grouped, rather than the users

type ClusterQuestionsChoiceCounts = {
  agree: number;
  disagree: number;
  skip: number;
  itsComplicated: number;
};

const countChoices = (responses: Choice[]): ClusterQuestionsChoiceCounts => {
  const counts = {
    agree: 0,
    disagree: 0,
    skip: 0,
    itsComplicated: 0,
  };

  responses.forEach((choice) => {
    switch (choice) {
      case "agree":
        counts.agree++;
        break;
      case "disagree":
        counts.disagree++;
        break;
      case "skip":
        counts.skip++;
        break;
      case "itsComplicated":
        counts.itsComplicated++;
        break;
    }
  });

  const total = responses.length;

  // Convert counts to percentages
  for (const key in counts) {
    counts[key as keyof ClusterQuestionsChoiceCounts] /= total;
  }

  return counts;
};

const ClusterQuestions = ({ responses }: { responses: Response[] }) => {
  const opinionMatrix = useMemo(() => getOpinionMatrix(responses), [responses]);
  const clusters = useMemo(
    () => clusterUsers(opinionMatrix, responses),
    [responses, opinionMatrix],
  );

  const statementIds = useMemo(() => getStatementIds(responses), [responses]);

  const questions = useMemo(() => {
    const questions = [];

    for (let j = 0; j < statementIds.length; j++) {
      const question = {
        statementId: statementIds[j],
        choiceCounts: [] as ClusterQuestionsChoiceCounts[],
      };

      for (let k = 0; k < clusters.length; k++) {
        const responses = clusters[k].flatMap(
          (u) =>
            u.statements
              .filter((c) => c.statementId === question.statementId)
              .map((c) => c.choice) as Choice[],
        );

        question.choiceCounts.push(countChoices(responses));
      }

      questions.push(question);
    }

    return questions;
  }, [clusters, statementIds]);

  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th className="px-4 py-2">Statement</th>
          <th className="px-4 py-2">Agree (%)</th>
          <th className="px-4 py-2">Disagree (%)</th>
          <th className="px-4 py-2">Skip (%)</th>
          <th className="px-4 py-2">It&apos;s Complicated (%)</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((question) => (
          <tr key={question.statementId}>
            <td className="px-4 py-2 border">{question.statementId}</td>
            {question.choiceCounts.map((choiceCount, i) => (
              <Fragment key={i}>
                <td className="px-4 py-2 border">
                  {(choiceCount.agree * 100).toFixed(2)}
                </td>
                <td className="px-4 py-2 border">
                  {(choiceCount.disagree * 100).toFixed(2)}
                </td>
                <td className="px-4 py-2 border">
                  {(choiceCount.skip * 100).toFixed(2)}
                </td>
                <td className="px-4 py-2 border">
                  {(choiceCount.itsComplicated * 100).toFixed(2)}
                </td>
              </Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const computeTsne = (
  opinionMatrix: number[][],
  perplexity: number = 30,
  epsilon: number = 10,
) => {
  const model = new TSNE({
    dim: 2,
    perplexity,
    epsilon,
  });

  model.initDataDist(opinionMatrix);
  for (let k = 0; k < 500; k++) {
    model.step();
  }

  return model.getSolution();
};

const ScatterPlot = ({
  data,
  clusters,
}: {
  data: number[][];
  clusters: ClusteredUser[][];
}) => {
  const dataset = useMemo(
    () =>
      clusters.map((cluster, i) => ({
        label: `Cluster ${i + 1}`,
        data: cluster.map((_, userIndex) => ({
          x: data[userIndex][0],
          y: data[userIndex][1],
        })),
        backgroundColor: `rgba(${Math.random() * 255}, ${
          Math.random() * 255
        }, ${Math.random() * 255}, 0.2)`,
        pointRadius: 5,
      })),
    [clusters, data],
  );

  const options = {
    scales: {
      x: {},
      y: {},
    },
  };

  return <Scatter data={{ datasets: dataset }} options={options} />;
};

const TwoDimensionalGraph = ({ responses }: { responses: Response[] }) => {
  const opinionMatrix = useMemo(() => getOpinionMatrix(responses), [responses]);
  const clusters = useMemo(
    () => clusterUsers(opinionMatrix, responses),
    [responses, opinionMatrix],
  );

  const tsneData = useMemo(() => computeTsne(opinionMatrix), [opinionMatrix]);

  return <ScatterPlot data={tsneData} clusters={clusters} />;
};

// Default export
// -----------------------------------------------------------------------------

const Graphs = ({
  responses,
  statementIds,
  graphType,
}: {
  responses: Response[];
  statementIds: Statement["id"][];
  graphType: GraphType;
}) => {
  if (graphType === GraphType.BackgroundBar) {
    return <BackgroundBar responses={responses} />;
  }

  if (graphType === GraphType.PerUserHeatmap) {
    return <PerUserHeatmap responses={responses} />;
  }

  if (graphType === GraphType.TotalHeatmap) {
    return <TotalHeatmap responses={responses} />;
  }

  if (graphType === GraphType.ClustersList) {
    return <ClustersList responses={responses} />;
  }

  if (graphType === GraphType.ClusterQuestions) {
    return <ClusterQuestions responses={responses} />;
  }

  if (graphType === GraphType.TwoDimensionalGraph) {
    return <TwoDimensionalGraph responses={responses} />;
  }

  return null;
};

export default Graphs;
