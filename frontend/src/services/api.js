import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const analyzeResume = async (
  resumeFile,
  jobDescription
) => {
  const formData = new FormData();

  formData.append(
    "resume",
    resumeFile
  );

  formData.append(
    "job_description",
    jobDescription || ""
  );

  const response = await axios.post(
    `${API_BASE_URL}/analyze`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const downloadPdf = () =>
  `${API_BASE_URL}/download-pdf`;

export const downloadTex = () =>
  `${API_BASE_URL}/download-tex`;

export const downloadCls = () =>
  `${API_BASE_URL}/download-cls`;

export const downloadZip = () =>
  `${API_BASE_URL}/download-zip`;

export const compileResume = async (resumeData) => {
  const response = await axios.post(
    `${API_BASE_URL}/compile`,
    resumeData
  );
  return response.data;
};