import { api } from '../lib/api';
import type { TeamOverview } from '../types/team';

interface Envelope<T> {
  data: T;
}

export async function getTeam(): Promise<TeamOverview> {
  const res = await api.get<Envelope<TeamOverview>>('/team');
  return res.data.data;
}
