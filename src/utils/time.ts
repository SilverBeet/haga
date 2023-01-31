export const formatDate = (date: Date) => new Intl.DateTimeFormat("default", {
    dateStyle: "short",
    timeStyle: "short",
}).format(date)