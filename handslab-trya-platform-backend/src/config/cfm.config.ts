import { registerAs } from '@nestjs/config';

export default registerAs('cfm', () => ({
  url: process.env.CFM_URL,
  apiKey: process.env.CFM_API_KEY,
}));
