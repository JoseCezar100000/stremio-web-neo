export const extractIMDbId = (metaItem: any): string | null => {
    if (!metaItem || !Array.isArray(metaItem.links)) {
        return null;
    }

    const imdbLink = metaItem.links.find((link: any) => 
        link && 
        link.category === 'imdb' && 
        typeof link.url === 'string' &&
        link.url.includes('imdb.com')
    );

    if (!imdbLink?.url) {
        return null;
    }

    const match = imdbLink.url.match(/tt\d+/);
    return match ? match[0] : null;
};

