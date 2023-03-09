export type Activity = {
  id: string;
  elapsed_time: number;
  moving_time: number;
  start_date: number;
  average_speed: number;
  max_speed: number;
  distance: number;
  total_elevation_gain: number;
};

export type Athlete = {
  id: string;
  firstname?: string;
  lastname?: string;
  sex?: string;
};
