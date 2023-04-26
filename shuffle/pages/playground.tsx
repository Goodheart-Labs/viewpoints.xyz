import apiConfig from "@/config/api";
import axios from "axios";

interface CommentsQueryParams {
  conversation_id: string;
  include_social: boolean;
  translate: boolean;
  lang: string;
}

const fetchComments = async ({
  conversation_id,
  include_social,
  translate,
  lang,
}: CommentsQueryParams) => {
  const queryString = `conversation_id=${conversation_id}&include_social=${include_social}&translate=${translate}&lang=${lang}`;

  return axios
    .get(`${apiConfig.localUrl}/comments?${queryString}`)
    .then((response) => response.data);
};

// const Fetch: React.FC<{}> = () => {
//   const queryParams: CommentsQueryParams = {
//     conversation_id: "64xyejahhh",
//     include_social: true,
//     translate: true,
//     lang: "en-US",
//   };

//   const {
//     data: comments,
//     error,
//     isLoading,
//   } = useQuery(["comments", queryParams], () => fetchComments(queryParams));

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {(error as Error).message}</div>;
//   }

//   return (
//     <div>
//       <h3>Comments:</h3>
//       <ul>
//         {comments.map((comment: any) => (
//           <li key={comment.id}>{comment.content}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

const Playground = () => (
  <main className="flex flex-col items-center w-full h-screen gradient">
    {/* <Fetch /> */}
  </main>
);

export default Playground;
