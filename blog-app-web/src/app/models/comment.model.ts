export interface CommentGetDto {
  id: string;
  content: string;
  createdAt: string;
  userName: string;
}

export interface AddCommentDto {
  blogPostId: string;
  content: string;
}
