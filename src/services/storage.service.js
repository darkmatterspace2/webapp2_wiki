// STORAGE SERVICE
// Centralized Supabase Storage operations for wiki-content bucket

const StorageService = {
    bucket: 'wiki-content',

    // Helper: Generate date-based path (data/posts/YYYY/MM/DD/HH/)
    _getDatePath() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        return `data/posts/${year}/${month}/${day}/${hour}`;
    },

    // Helper: Generate full path for article upload
    generateArticlePath(title) {
        const datePath = this._getDatePath();
        const safeName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${Date.now()}_${safeName}.html`;
        return `${datePath}/${fileName}`;
    },

    // UPLOAD ARTICLE: Upload to date-based folder structure
    async uploadArticle(title, content) {
        const path = this.generateArticlePath(title);
        await this.upload(path, content);
        return path;
    },

    // UPLOAD: Upload content to storage (generic)
    async upload(path, content, contentType = 'text/html') {
        const sbClient = AppUtils.initSupabase();
        const blob = new Blob([content], { type: contentType });
        const { error } = await sbClient.storage
            .from(this.bucket)
            .upload(path, blob, { upsert: true });
        if (error) throw error;
        return path;
    },

    // DOWNLOAD: Get content from storage
    async download(path) {
        const sbClient = AppUtils.initSupabase();
        const { data, error } = await sbClient.storage
            .from(this.bucket)
            .download(path);
        if (error) throw error;
        return data;
    },

    // DOWNLOAD AS TEXT: Get content as string
    async downloadAsText(path) {
        const blob = await this.download(path);
        return await blob.text();
    },

    // DELETE: Remove file from storage
    async delete(path) {
        const sbClient = AppUtils.initSupabase();
        const { error } = await sbClient.storage
            .from(this.bucket)
            .remove([path]);
        if (error) throw error;
    },

    // GET PUBLIC URL
    getPublicUrl(path) {
        const sbClient = AppUtils.initSupabase();
        const { data } = sbClient.storage
            .from(this.bucket)
            .getPublicUrl(path);
        return data?.publicUrl;
    }
};

window.StorageService = StorageService;

