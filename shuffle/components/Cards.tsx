import Card, { CardViewProps, Valence } from "./Card";
import { AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";

// Types
// -----------------------------------------------------------------------------

type CardsProps = {};

// Default export
// -----------------------------------------------------------------------------

const Cards = ({}: CardsProps) => {
  const [cards, setCards] = useState<CardViewProps[]>([
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
    (card: CardViewProps, valence: Valence) => {
      console.log(`${card.cardId} - ${valence}`);
      setCards(cards.filter((c) => c.cardId !== card.cardId));
    },
    [cards]
  );

  return (
    <AnimatePresence>
      {cards.map((card) => (
        <Card key={card.cardId} card={card} onSwipe={handleSwipe} />
      ))}
    </AnimatePresence>
  );
};

export default Cards;
