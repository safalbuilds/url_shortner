export const urlExists = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    return response.ok;
  } catch {
    return false;
  }
};
