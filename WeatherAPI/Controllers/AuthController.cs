using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherAPI.Data;
using WeatherAPI.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;

namespace WeatherAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        // Constructor: We ask for the Database so we can use it
        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            // 1. Check if the user already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest("User already exists.");
            }

            // 2. Hash the password (Scramble it so it's secure)
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 3. Create the real User object
            var user = new User
            {
                Username = request.Username,
                PasswordHash = passwordHash,
                Role = "User"
            };

            // 4. Save to Database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully!");
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            // 1. Find user by username
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            // 2. Check if user exists OR if password matches the hash
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Wrong username or password.");
            }

            // 3. Create the "Claims" (Details on the ID card)
            // We put the Username and Role inside the token so the frontend knows who this is.
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            // 4. Create the Secret Key (The Stamp)
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("Jwt:Key").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // 5. Generate the Token Object
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Token lasts 1 day
                signingCredentials: creds
            );

            // 6. Write the Token as a string and send it back
            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(jwt);
        }
    }
}