

export interface EditBlogPostRequest {
    title: string;
    shortDescription: string;
    content: string;
    featureImageUrl: string;
    urlHandle: string;
    publishDate: Date;
    author: string;
    isVisible: boolean;
    categories: string[];
  }
  