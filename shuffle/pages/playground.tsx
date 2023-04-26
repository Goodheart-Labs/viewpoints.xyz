import Cards from "@/components/Cards";
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
    <div className="flex flex-col my-40 text-center max-w-[800px]">
      <h1 className="mb-4 text-4xl font-bold text-black">Poly discussion</h1>
      <h2 className="text-xl text-gray-800">
        The poly discourse happens a lot, but I don&apos;t think we get concrete
        enough. Here are some statements to vote on to try and see where we
        agree and disagree.
      </h2>
    </div>
    <div className="mt-20">
      <div className="relative flex flex-col items-center justify-center w-full sm:min-w-[600px]">
        <Cards />
      </div>
    </div>
    {/* <Fetch /> */}
  </main>
);

export default Playground;
