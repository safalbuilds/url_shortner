import { generateShortCode } from "../utils/shortCode.js";

export const createShortUrl = (originalUrl : string) => {
    return{
        originalUrl,
        shortcode : generateShortCode()
    }
}