type CardEvent<T> = {
  type: T;
  pollId: number;
  cardId: number;
};

export type TrackingEvent =
  | CardEvent<"votes.agree">
  | CardEvent<"votes.disagree">
  | CardEvent<"votes.skip">
  | CardEvent<"votes.itsComplicated">
  | CardEvent<"statement.flag.open">
  | {
      type: "statement.flag.persist";
      statementId: number;
      reason: string;
    }
  | CardEvent<"statement.flag.cancel">
  | {
      type: "statement.new.open";
      pollId: number;
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
    }
  | {
      type: "comment.create";
    }
  | {
      type: "comment.delete";
    };
