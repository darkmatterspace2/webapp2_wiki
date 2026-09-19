// ARTICLE SERVICE
// Centralized CRUD operations for wiki_articles table

const ArticleService = {

    // Helper: Normalize tags
    // - TRIM: Remove leading/trailing whitespace
    // - Lowercase: Force everything to lowercase
    // - Replace spaces with underscores
    // - Strip special symbols (!@#$%^&* etc.)
    _normalizeTags(articleData) {
        if (articleData.tags && Array.isArray(articleData.tags)) {
            articleData.tags = articleData.tags.map(tag => {
                return tag
                    .trim()                           // Remove leading/trailing whitespace
                    .toLowerCase()                    // Force lowercase
                    .replace(/\s+/g, '_')             // Replace spaces with underscores
                    .replace(/[!@#$%^&*()+=\[\]{};:'",.<>?\\|`~]/g, ''); // Strip special symbols
            }).filter(tag => tag.length > 0);         // Remove empty tags
        }
        return articleData;
    },

    // Helper: Parse Booru-style search query
    // Returns: { titleTerms: [], required: [], excluded: [], optional: [], wildcards: [] }
    _parseSearchQuery(searchStr) {
        const result = {
            titleTerms: [],   // Regular words (search title + tags)
            required: [],     // tag1 tag2 (AND - must have all)
            excluded: [],     // -tag (NOT - must not have)
            optional: [],     // ~tag (OR - have any)
            wildcards: []     // tag* (starts with)
        };

        if (!searchStr || !searchStr.trim()) return result;

        const terms = searchStr.trim().toLowerCase().split(/\s+/);

        for (const term of terms) {
            if (!term) continue;

            if (term.startsWith('-') && term.length > 1) {
                // Excluded tag
                result.excluded.push(term.slice(1).replace(/\s+/g, '_'));
            } else if (term.startsWith('~') && term.length > 1) {
                // Optional tag (OR)
                result.optional.push(term.slice(1).replace(/\s+/g, '_'));
            } else if (term.endsWith('*') && term.length > 1) {
                // Wildcard
                result.wildcards.push(term.slice(0, -1).replace(/\s+/g, '_'));
            } else {
                // Regular term - search both title and tags
                result.titleTerms.push(term.replace(/\s+/g, '_'));
            }
        }

        return result;
    },

    // GET: Paginated list with Booru-style search, sorting, and date filters
    async getList(options = {}) {
        const {
            page = 1,
            limit = 10,
            category = 'all',
            search = '',
            showRRated = false,
            sortBy = 'created_at',
            sortAsc = false,
            dateFrom = null,
            dateTo = null
        } = options;

        const sbClient = AppUtils.initSupabase();

        // Parse the search query
        const parsed = this._parseSearchQuery(search);
        const hasAdvancedSearch = parsed.titleTerms.length > 0 ||
            parsed.excluded.length > 0 ||
            parsed.optional.length > 0 ||
            parsed.wildcards.length > 0;

        // For advanced search, we fetch more and filter client-side
        let fetchLimit = limit;
        let fetchFrom = (page - 1) * limit;

        if (hasAdvancedSearch) {
            fetchLimit = 500; // Fetch a larger batch
            fetchFrom = 0;
        }

        let query = sbClient
            .from('wiki_articles')
            .select('*', { count: 'exact' });

        // Sorting
        if (sortBy === 'updated_at') {
            query = query.order('updated_at', { ascending: sortAsc, nullsFirst: false });
        } else if (sortBy === 'views') {
            query = query.order('views', { ascending: sortAsc });
        } else if (sortBy === 'title') {
            query = query.order('title', { ascending: sortAsc });
        } else {
            query = query.order('created_at', { ascending: sortAsc });
        }

        // Date range filters (Month/Year archives)
        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        if (!hasAdvancedSearch) {
            query = query.range(fetchFrom, fetchFrom + fetchLimit - 1);
        }

        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }
        if (category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        // Client-side filtering for advanced search
        let filteredData = data || [];

        if (hasAdvancedSearch) {
            filteredData = filteredData.filter(article => {
                const tags = (article.tags || []).map(t => t.toLowerCase());
                const title = (article.title || '').toLowerCase();

                // Check required terms (AND) - must match title OR be in tags
                for (const term of parsed.titleTerms) {
                    const inTitle = title.includes(term);
                    const inTags = tags.some(t => t === term || t.includes(term));
                    if (!inTitle && !inTags) return false;
                }

                // Check excluded tags (NOT)
                for (const tag of parsed.excluded) {
                    if (tags.includes(tag)) return false;
                }

                // Check optional tags (OR) - at least one must match
                if (parsed.optional.length > 0) {
                    const hasAny = parsed.optional.some(opt => tags.includes(opt));
                    if (!hasAny) return false;
                }

                // Check wildcards
                for (const prefix of parsed.wildcards) {
                    const matches = tags.some(t => t.startsWith(prefix)) ||
                        title.includes(prefix);
                    if (!matches) return false;
                }

                return true;
            });

            // Apply sorting client-side
            filteredData.sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];

                if (sortBy === 'title') {
                    valA = (valA || '').toLowerCase();
                    valB = (valB || '').toLowerCase();
                    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }

                if (sortBy === 'views') {
                    valA = valA || 0;
                    valB = valB || 0;
                    return sortAsc ? valA - valB : valB - valA;
                }

                // Timestamps
                const timeA = new Date(valA || 0).getTime();
                const timeB = new Date(valB || 0).getTime();
                return sortAsc ? timeA - timeB : timeB - timeA;
            });

            // Apply pagination to filtered results
            const total = filteredData.length;
            const from = (page - 1) * limit;
            const to = from + limit;
            filteredData = filteredData.slice(from, to);

            return { articles: filteredData, total: total };
        }

        return { articles: filteredData, total: count };
    },

    // GET: Single article by ID
    async getById(id) {
        const sbClient = AppUtils.initSupabase();
        const { data, error } = await sbClient
            .from('wiki_articles')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // GET: Random Article ID
    async getRandom(showRRated = false) {
        const sbClient = AppUtils.initSupabase();
        let query = sbClient.from('wiki_articles').select('id');
        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }
        const { data, error } = await query;
        if (error || !data || data.length === 0) return null;
        const randomItem = data[Math.floor(Math.random() * data.length)];
        return randomItem.id;
    },

    // GET: Summary stats for terminal dashboard
    async getStats(showRRated = false) {
        const sbClient = AppUtils.initSupabase();
        let query = sbClient.from('wiki_articles').select('category, views', { count: 'exact' });
        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }
        const { data, count, error } = await query;
        if (error) throw error;

        const totalArticles = count || 0;
        let totalViews = 0;
        const uniqueCategories = new Set();

        if (data) {
            data.forEach(item => {
                totalViews += (item.views || 0);
                if (item.category) uniqueCategories.add(item.category);
            });
        }

        return {
            totalArticles,
            totalViews,
            totalCategories: uniqueCategories.size
        };
    },

    // GET: Date archive tree (Year -> Month -> Count)
    async getArchiveIndex(showRRated = false) {
        const sbClient = AppUtils.initSupabase();
        let query = sbClient.from('wiki_articles').select('created_at').order('created_at', { ascending: false });
        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }
        const { data, error } = await query;
        if (error) throw error;

        const archiveTree = {};
        if (data) {
            data.forEach(item => {
                if (!item.created_at) return;
                const d = new Date(item.created_at);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');

                if (!archiveTree[year]) {
                    archiveTree[year] = { count: 0, months: {} };
                }
                archiveTree[year].count++;

                if (!archiveTree[year].months[month]) {
                    archiveTree[year].months[month] = 0;
                }
                archiveTree[year].months[month]++;
            });
        }
        return archiveTree;
    },

    // GET: Popular tags for search tag chips
    async getPopularTags(limit = 8, showRRated = false) {
        const sbClient = AppUtils.initSupabase();
        let query = sbClient.from('wiki_articles').select('tags').limit(200);
        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }
        const { data, error } = await query;
        if (error || !data) return [];

        const tagCounts = {};
        data.forEach(item => {
            if (Array.isArray(item.tags)) {
                item.tags.forEach(t => {
                    const tag = (t || '').trim().toLowerCase();
                    if (tag) {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    }
                });
            }
        });

        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => ({ tag: entry[0], count: entry[1] }));
    },

    // CREATE: Insert new article
    async create(articleData) {
        const sbClient = AppUtils.initSupabase();
        // Normalize tags to lowercase
        this._normalizeTags(articleData);
        const { data, error } = await sbClient
            .from('wiki_articles')
            .insert([articleData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // UPDATE: Update existing article
    async update(id, updates) {
        const sbClient = AppUtils.initSupabase();
        // Normalize tags to lowercase
        this._normalizeTags(updates);
        const { data, error } = await sbClient
            .from('wiki_articles')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
        return data;
    },

    // DELETE: Remove article
    async delete(id) {
        const sbClient = AppUtils.initSupabase();
        const { error } = await sbClient
            .from('wiki_articles')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // UPDATE: Increment view count
    async incrementViews(id, currentViews) {
        const sbClient = AppUtils.initSupabase();
        await sbClient
            .from('wiki_articles')
            .update({ views: (currentViews || 0) + 1 })
            .eq('id', id);
    }
};

window.ArticleService = ArticleService;

