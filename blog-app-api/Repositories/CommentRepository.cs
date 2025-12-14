using BlogAppAPI.Data;
using BlogAppAPI.Models.Domain;
using BlogAppAPI.Models.DTO;
using BlogAppAPI.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace BlogAppAPI.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDbContext _context;

        public CommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Comment> AddAsync(Comment comment)
        {
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment?> GetByIdAsync(Guid id)
        {
            return await _context.Comments.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task DeleteAsync(Comment comment)
        {
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
        }

        public async Task<List<CommentGetDto>> GetForBlogAsync(Guid blogPostId)
        {
            return await _context.Comments
                .Where(c => c.BlogPostId == blogPostId)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentGetDto
                {
                    Id = c.Id,
                    Content = c.content,
                    CreatedAt = c.CreatedAt,
                    UserName = c.User.FullName
                })
                .ToListAsync();
        }
    }
}
