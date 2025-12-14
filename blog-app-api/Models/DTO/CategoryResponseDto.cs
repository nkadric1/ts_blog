using BlogAppAPI.Models.Domain;
namespace BlogAppAPI.Models.DTO
{
public class CategoryResponseDto
{
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public Category Data { get; set; }
}
}