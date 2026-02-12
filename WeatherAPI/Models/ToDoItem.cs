namespace WeatherAPI.Models
{
    public class ToDoItem
    {
        public int Id { get; set; }
        public required string Text { get; set; }
        public bool IsCompleted { get; set; }
        public required string Username { get; set; }

        // Add this line if it's missing!
        public string Category { get; set; } = "General";
    }
}