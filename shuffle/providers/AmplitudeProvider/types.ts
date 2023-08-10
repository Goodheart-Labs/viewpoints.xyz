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
  | ExtendedCardEvent<"comments.edit.open">
  | CardEvent<"comments.edit.persist">
  | CardEvent<"comments.edit.cancel">
  | ExtendedCardEvent<"comments.flag.open">
  | {
      type: "comments.flag.persist";
      commentId: number;
      reason: string;
      interactionMode: InteractionMode;
    }
  | CardEvent<"comments.flag.cancel">
  | {
      type: "comments.new.open";
      pollId: number;
      interactionMode: InteractionMode;
    }
  | {
      type: "comments.new.persist";
      pollId: number;
      comment: string;
      edited_from_id?: number;
    }
  | {
      type: "comments.new.cancel";
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
