import apiConfig from "@/config/api";
import axios from "axios";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useCallback, useState } from "react";
import {
  PencilIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

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

const Avatar = ({ url, alt }: { url: string; alt: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img className="inline-block w-8 h-8 rounded-full" src={url} alt={alt} />
);

type CardContentProps = {
  author: {
    name: string;
    avatar: string;
  };
  comment: string;
};

const CardContent = ({
  author: { name, avatar },
  comment,
}: CardContentProps) => (
  <>
    <div className="flex flex-col px-4 py-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-2">
            <Avatar url={avatar} alt={name} />
          </div>
          <div className="text-sm font-semibold text-gray-600">{name}</div>
        </div>
        <div>
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="flex">
        <div className="text-lg">{comment}</div>
      </div>
    </div>
    <div className="w-full px-4 py-4 bg-gray-50 sm:px-6">
      <div className="flex justify-between">
        <div>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            &larr; Disagree
          </button>
        </div>
        <div>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-md hover:text-white hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            Agree &rarr;
          </button>
        </div>
      </div>
    </div>
  </>
);

type Valence = "agree" | "disagree";
type Card = {
  id: string;
  render: () => React.ReactNode;
};

const Card = ({
  card,
  onSwipe,
}: {
  card: Card;
  onSwipe: (card: Card, valence: Valence) => void;
}) => {
  const [leaveX, setLeaveX] = useState(0);
  const onDragEnd = (_e: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setLeaveX(1000);
      onSwipe(card, "agree");
    }
    if (info.offset.x < -100) {
      setLeaveX(-1000);
      onSwipe(card, "disagree");
    }
  };

  return (
    <motion.div
      drag={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      initial={{
        scale: 1,
      }}
      animate={{
        scale: 1.05,
        rotate: `${Number(card.id) % 2 === 0 ? 2 : -2}deg`,
      }}
      exit={{
        x: leaveX,
        y: 0,
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.2 },
      }}
      className="absolute min-w-[320px] max-w-[600px] flex flex-col justify-center items-center cursor-grab overflow-hidden bg-white rounded-lg shadow"
    >
      {card.render()}
    </motion.div>
  );
};

const Cards = () => {
  const [cards, setCards] = useState<Card[]>([
    {
      id: "1",
      render: () => (
        <CardContent
          author={{
            name: "Nathan Young",
            avatar:
              "https://pbs.twimg.com/profile_images/1554232496333754368/4O6anLwp_normal.jpg",
          }}
          comment="Monogamy is important to me emotionally, regardless of the practical pros and cons."
        />
      ),
    },
    {
      id: "2",
      render: () => (
        <CardContent
          author={{
            name: "Nathan Young",
            avatar:
              "https://pbs.twimg.com/profile_images/1554232496333754368/4O6anLwp_normal.jpg",
          }}
          comment="Personally I'd find it very stressful to be emotional and romantically very close to multiple people at once."
        />
      ),
    },
    {
      id: "3",
      render: () => (
        <CardContent
          author={{
            name: "Nathan Young",
            avatar:
              "https://pbs.twimg.com/profile_images/1554232496333754368/4O6anLwp_normal.jpg",
          }}
          comment="Polyamory in Western liberal democracies shouldn't be compared to historical polyamory because it's very different."
        />
      ),
    },
  ]);

  const handleSwipe = useCallback(
    (card: Card, valence: Valence) => {
      console.log(`${card.id} - ${valence}`);
      setCards(cards.filter((c) => c.id !== card.id));
    },
    [cards]
  );

  return (
    <AnimatePresence>
      {cards.map((card) => (
        <Card key={card.id} card={card} onSwipe={handleSwipe} />
      ))}
    </AnimatePresence>
  );
};

const Playground = () => (
  <main
    className={`relative flex flex-col justify-center items-center w-full h-screen gradient`}
  >
    <Cards />
    {/* <Fetch /> */}
  </main>
);

export default Playground;
