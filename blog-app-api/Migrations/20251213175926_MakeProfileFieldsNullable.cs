using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BlogAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeProfileFieldsNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "b1244b80-8512-4998-9825-663ec0504c7f");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "ba80eb88-d33d-4454-9262-f89aed9c6a39");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "284afd0b-e6d8-4470-ad4d-b611818e6212", null, "User", "USER" },
                    { "49d3c28e-0af6-48b5-bd64-129ad23c1891", null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "284afd0b-e6d8-4470-ad4d-b611818e6212");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "49d3c28e-0af6-48b5-bd64-129ad23c1891");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "b1244b80-8512-4998-9825-663ec0504c7f", null, "Admin", "ADMIN" },
                    { "ba80eb88-d33d-4454-9262-f89aed9c6a39", null, "User", "USER" }
                });
        }
    }
}
