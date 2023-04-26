import Card, { CardContent, Valence } from "./Card";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import BorderedButton from "./BorderedButton";
import { PlusIcon } from "@heroicons/react/20/solid";

// Types
// -----------------------------------------------------------------------------

type CardsProps = {};

// Default export
// -----------------------------------------------------------------------------

const Cards = ({}: CardsProps) => {
  const [cards, setCards] = useState<CardContent[]>([
    {
      cardId: "1",
      author: {
        name: "Nathan Young",
        avatar:
          "https://pbs.twimg.com/profile_images/1554232496333754368/4O6anLwp_normal.jpg",
      },
      comment:
        "Monogamy is important to me emotionally, regardless of the practical pros and cons.",
    },
    {
      cardId: "2",
      author: {
        name: "Nathan Young",
        avatar:
          "https://pbs.twimg.com/profile_images/1554232496333754368/4O6anLwp_normal.jpg",
      },
      comment:
        "Personally I'd find it very stressful to be emotional and romantically very close to multiple people at once.",
    },
    {
      cardId: "3",
      author: {
        name: "Nathan Young",
        avatar:
          "https://pbs.twimg.com/profile_images/1554232496333754368/4O6anLwp_normal.jpg",
      },
      comment:
        "Polyamory in Western liberal democracies shouldn't be compared to historical polyamory because it's very different.",
    },
  ]);

  const handleSwipe = useCallback(
    (card: CardContent, valence: Valence) => {
      console.log(`${card.cardId} - ${valence}`);
      setCards(cards.filter((c) => c.cardId !== card.cardId));
    },
    [cards]
  );

  return (
    <div className="relative flex flex-col items-center justify-center w-full sm:min-w-[600px]">
      <AnimatePresence>
        {cards.map((card) => (
          <Card key={card.cardId} card={card} onSwipe={handleSwipe} />
        ))}

        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col w-full p-10 -mt-20 border border-gray-800 rounded-lg min-w-[320px] max-w-[600px]"
          >
            <div className="pb-4 text-center">
              You&apos;ve answered all the comments!
            </div>
            <div className="text-center">
              <BorderedButton color="blue" className="flex items-center">
                <PlusIcon width={28} className="mr-1" /> Add a new comment
              </BorderedButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Cards;
