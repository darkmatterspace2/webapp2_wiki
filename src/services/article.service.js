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

    // GET: Paginated list with Booru-style search
    async getList(options = {}) {
        const {
            page = 1,
            limit = 10,
            category = 'all',
            search = '',
            showRRated = false
        } = options;

        const sbClient = AppUtils.initSupabase();

        // Parse the search query
        const parsed = this._parseSearchQuery(search);
        const hasAdvancedSearch = parsed.titleTerms.length > 0 ||
            parsed.excluded.length > 0 ||
            parsed.optional.length > 0 ||
            parsed.wildcards.length > 0;

        // For advanced search, we fetch more and filter client-side
        // This is needed because Supabase array operators are limited
        let fetchLimit = limit;
        let fetchFrom = (page - 1) * limit;

        if (hasAdvancedSearch) {
            // Fetch more for client-side filtering
            fetchLimit = 500; // Fetch a larger batch
            fetchFrom = 0;
        }

        let query = sbClient
            .from('wiki_articles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

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
