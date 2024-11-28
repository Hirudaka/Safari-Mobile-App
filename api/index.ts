import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const uploadImage = async (file: FormData) => {
  try {
    const response = await api.post("/predict", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios error
      throw new Error(error.response?.data?.message || error.message);
    } else if (error instanceof Error) {
      // Other errors
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
