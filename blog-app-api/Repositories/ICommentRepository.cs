using BlogAppAPI.Models.Domain;
using BlogAppAPI.Models.DTO;

namespace BlogAppAPI.Repositories.Interface
{
    public interface ICommentRepository
    {
        Task<Comment> AddAsync(Comment comment);
        Task<Comment?> GetByIdAsync(Guid id);
        Task DeleteAsync(Comment comment);

        Task<List<CommentGetDto>> GetForBlogAsync(Guid blogPostId);
    }
}
