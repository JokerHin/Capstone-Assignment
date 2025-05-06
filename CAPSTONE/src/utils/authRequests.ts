import axios from "axios";

// Function to make authenticated API requests
export const makeAuthRequest = async (
  url: string,
  credentials: { email: string; password: string },
  options: any = {}
) => {
  const requestData = {
    ...options.data,
    email: credentials.email,
    password: credentials.password,
  };

  return axios({
    url,
    method: options.method || "POST",
    headers: options.headers || {},
    data: requestData,
  });
};
