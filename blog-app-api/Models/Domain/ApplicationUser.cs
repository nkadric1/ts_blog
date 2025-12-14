using Microsoft.AspNetCore.Identity;

namespace BlogAppAPI.Models.Domain
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
        public string Bio { get; set; }
        public string ProfileImageUrl { get; set; }
        public ICollection<Comment> Comments { get; set; }

    }
}
