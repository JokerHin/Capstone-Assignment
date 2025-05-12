interface Subquest {
  subquest_id: number;
  title: string;
  description?: string;
}

interface Quest {
  quest_id: number;
  title: string;
}

declare const questData: Quest[];
export default questData;
