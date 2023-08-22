export type InteractionMode = "click" | "keyboard";

type CardEvent<T> = {
  type: T;
  pollId: number;
  cardId: number;
};

type ExtendedCardEvent<T> = CardEvent<T> & {
  interactionMode: InteractionMode;
};

export type TrackingEvent =
  | ExtendedCardEvent<"votes.agree">
  | ExtendedCardEvent<"votes.disagree">
  | ExtendedCardEvent<"votes.skip">
  | ExtendedCardEvent<"votes.itsComplicated">
  | ExtendedCardEvent<"statement.flag.open">
  | {
      type: "statement.flag.persist";
      statementId: number;
      reason: string;
      interactionMode: InteractionMode;
    }
  | CardEvent<"statement.flag.cancel">
  | {
      type: "statement.new.open";
      pollId: number;
      interactionMode: InteractionMode;
    }
  | {
      type: "statement.new.persist";
      pollId: number;
      text: string;
    }
  | {
      type: "statement.new.cancel";
      pollId: number;
    }
  | {
      type: "polls.new.open";
    }
  | {
      type: "drag";
    }
  | {
      type: "votes.viewAll";
    };
