using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherAPI.Data;
using WeatherAPI.Models;

namespace WeatherAPI.Controllers
{
    [Authorize] // Lock the door!
    [Route("api/[controller]")]
    [ApiController]
    public class ToDoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ToDoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ToDo (Get MY tasks only)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ToDoItem>>> GetMyToDos()
        {
            var username = User.Identity?.Name; // Get username from the Token
            return await _context.ToDos
                                 .Where(t => t.Username == username) // Filter!
                                 .ToListAsync();
        }

        // POST: api/ToDo (Add a new task)
        [HttpPost]
        public async Task<ActionResult<ToDoItem>> AddToDo(ToDoItem task)
        {
            var username = User.Identity?.Name;

            // Force the username to match the token (prevents hacking)
            task.Username = username!;

            _context.ToDos.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        // DELETE: api/ToDo/{id} (Delete a task)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteToDo(int id)
        {
            var username = User.Identity?.Name;

            // Find the task AND make sure it belongs to this user
            var task = await _context.ToDos
                                     .FirstOrDefaultAsync(t => t.Id == id && t.Username == username);

            if (task == null) return NotFound("Task not found or you don't own it.");

            _context.ToDos.Remove(task);
            await _context.SaveChangesAsync();

            return Ok("Deleted");
        }
    }
}