export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  roles?: string[];
}

export interface BaseUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  publicId?: string;
}

export interface ConnectedUser extends BaseUser {
  authorities?: string[];
}
