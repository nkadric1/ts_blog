namespace BlogAppAPI.Models.DTO{
    public class AddCommentDto
    {
        public Guid BlogPostId { get; set; }
        public string Content { get; set; }
    }
}