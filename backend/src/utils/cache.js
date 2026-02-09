const cache = {};

// Default TTL: 24 hours (Effective "once per day" given date keys)
const DEFAULT_TTL = 24 * 60 * 60 * 1000; 

export const getCache = (key) => {
    const item = cache[key];
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
        delete cache[key];
        return null;
    }
    
    return item.data;
};

export const setCache = (key, data, ttl = DEFAULT_TTL) => {
    cache[key] = {
        data,
        expiry: Date.now() + ttl
    };
    return data;
};

export const clearCache = (key) => {
    delete cache[key];
};

export const flushCache = () => {
    for (const key in cache) delete cache[key];
};
