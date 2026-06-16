import { v4 as uuidv4 } from 'uuid';

interface UserRequest {
  name?: string;
  email?: string;
  roles?: string[];
  organisations?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  groups?: string[];
}

export type User = UserRequest & {
  id: string;
};

const createUser = (request: UserRequest): User => {
  return {
    id: uuidv4(),
    ...request,
  };
};

export const USER_DATA: User[] = [
  createUser({
    name: 'John Doe',
    email: 'john.doe@example.com',
    roles: ['Admin'],
    organisations: ['Hyper I'],
    is_active: true,
    groups: ['Admin'],
  }),
  createUser({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    roles: ['Data Analyst'],
    organisations: [],
    is_active: true,
    groups: [],
  }),
  createUser({
    name: 'Jeremy Light',
    email: 'jeremy.light@example.com',
    roles: ['Data Analyst', 'Data Scientist'],
    organisations: [],
    is_active: false,
    groups: [],
  }),
  createUser({
    name: 'Jennifer Vance',
    email: 'jennifer.vance@example.com',
    roles: [],
    organisations: ['Hyper I'],
    is_active: true,
    groups: ['Data'],
  }),
  createUser({
    name: 'Gavin White',
    email: 'gavin.white@example.com',
    roles: ['Read Only'],
    organisations: ['HyperSec'],
    is_active: true,
    groups: ['Security'],
  }),
  createUser({
    name: 'Claire Bell',
    email: 'claire.bell@example.com',
    roles: ['Admin'],
    organisations: ['HyperSec'],
    is_active: true,
    groups: ['Security'],
  }),
  createUser({
    name: 'Ava Lovelace',
    email: 'ava.lovelace@example.com',
    roles: ['Admin'],
    organisations: ['Hyper I', 'HyperSec'],
    is_active: true,
    groups: ['Admin', 'Security'],
  }),
  createUser({
    name: 'Alan Turing',
    email: 'alan.turing@example.com',
    roles: ['Admin'],
    organisations: ['Hyper I', 'HyperSec'],
    is_active: true,
    groups: ['Admin', 'Security'],
  }),
  createUser({
    name: 'Grace Hopper',
    email: 'grace.hopper@example.com',
    roles: ['Admin'],
    organisations: ['Hyper I', 'HyperSec'],
    is_active: true,
    groups: ['Admin', 'Security'],
  }),
];
