export type LocalProfile = {
    id: string;
    name: string;
    isAdmin: boolean;
    createdAt: number;
    nameCustomized?: boolean;
};

export type LocalProfileSnapshot = Record<string, string>;


