import { gql, useQuery } from "urql";

// const TestQuery = gql`
//   query {
//     todos {
//       id
//       title
//     }
//   }
// `;

// const Fetch = () => {
//   const [result, reexecuteQuery] = useQuery({
//     query: TestQuery,
//   });

//   const { data, fetching, error } = result;

//   if (fetching) return <p>Loading...</p>;
//   if (error) return <p>Oh no... {error.message}</p>;

//   console.log(data);

//   return null;
// };

const Playground = () => (
  <main
    className={`flex min-h-screen flex-col items-center justify-between p-24`}
  ></main>
);

export default Playground;
