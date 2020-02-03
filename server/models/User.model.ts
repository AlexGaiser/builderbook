export default interface User {
  id: string;
  googleId: string;
  googleToken: {
    accessToken: string;
    refresh_token: string;
    token_type: string;
    expiry_date: number;
  };
  slug: string;
  createdAt: Date;
  email: string;
  isAdmin: boolean;
  displayName: string;
  avatarUrl: string;
  purchaseBookIds: string[];
  freebookIds: string[];
  isGithubConnected: boolean;
  githubAccessToken: string;
}
