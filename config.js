module.exports = {
    apiUrl: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full&",
    cronSchedule: "0 0 20 * * *",
    apiKeyPath: "./apiKey"
};