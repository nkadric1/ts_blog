using BlogAppAPI.Models.Domain;
using BlogAppAPI.Models.DTO;
using BlogAppAPI.Repositories.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogAppAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentRepository _repo;

        public CommentsController(ICommentRepository repo)
        {
            _repo = repo;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody] AddCommentDto dto)
        {
            var userId = User.FindFirstValue("id");
            if (userId == null) return Unauthorized();

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                content = dto.Content,
                BlogPostId = dto.BlogPostId,
                UserId = userId
            };

            var created = await _repo.AddAsync(comment);
            return Ok(created);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            var comment = await _repo.GetByIdAsync(id);
            if (comment == null) return NotFound();

            await _repo.DeleteAsync(comment);
            return NoContent();
        }

        [HttpGet("blog/{blogPostId}")]
        public async Task<IActionResult> GetCommentsForBlog(Guid blogPostId)
        {
            var comments = await _repo.GetForBlogAsync(blogPostId);
            return Ok(comments);
        }
    }
}
