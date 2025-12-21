// ARTICLE SERVICE
// Centralized CRUD operations for wiki_articles table

const ArticleService = {

    // GET: Paginated list with filters
    async getList(options = {}) {
        const {
            page = 1,
            limit = 10,
            category = 'all',
            search = '',
            showRRated = false
        } = options;

        const sbClient = AppUtils.initSupabase();
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = sbClient
            .from('wiki_articles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }
        if (category !== 'all') {
            query = query.eq('category', category);
        }
        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return { articles: data, total: count };
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
