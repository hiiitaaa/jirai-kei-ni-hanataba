import tkinter as tk
from tkinter import messagebox
import random
from typing import List, Tuple, Set

class Minesweeper:
    def __init__(self, width: int = 10, height: int = 10, mines: int = 10):
        self.width = width
        self.height = height
        self.mines = mines
        self.board = [[0 for _ in range(width)] for _ in range(height)]
        self.revealed = [[False for _ in range(width)] for _ in range(height)]
        self.flagged = [[False for _ in range(width)] for _ in range(height)]
        self.mine_positions = set()
        self.game_over = False
        self.game_won = False
        self.first_click = True

    def place_mines(self, exclude_x: int, exclude_y: int):
        placed = 0
        while placed < self.mines:
            x = random.randint(0, self.width - 1)
            y = random.randint(0, self.height - 1)

            if (x, y) not in self.mine_positions and (x, y) != (exclude_x, exclude_y):
                self.mine_positions.add((x, y))
                self.board[y][x] = -1
                placed += 1

                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < self.width and 0 <= ny < self.height and self.board[ny][nx] != -1:
                            self.board[ny][nx] += 1

    def reveal(self, x: int, y: int) -> List[Tuple[int, int]]:
        if self.game_over or self.game_won:
            return []

        if self.first_click:
            self.place_mines(x, y)
            self.first_click = False

        if self.flagged[y][x]:
            return []

        if self.revealed[y][x]:
            return []

        revealed_cells = []
        self._reveal_recursive(x, y, revealed_cells)

        if self.board[y][x] == -1:
            self.game_over = True
            return revealed_cells

        if self.check_win():
            self.game_won = True

        return revealed_cells

    def _reveal_recursive(self, x: int, y: int, revealed_cells: List[Tuple[int, int]]):
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            return

        if self.revealed[y][x] or self.flagged[y][x]:
            return

        self.revealed[y][x] = True
        revealed_cells.append((x, y))

        if self.board[y][x] == 0:
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue
                    self._reveal_recursive(x + dx, y + dy, revealed_cells)

    def toggle_flag(self, x: int, y: int):
        if not self.revealed[y][x] and not self.game_over:
            self.flagged[y][x] = not self.flagged[y][x]

    def check_win(self) -> bool:
        for y in range(self.height):
            for x in range(self.width):
                if self.board[y][x] != -1 and not self.revealed[y][x]:
                    return False
        return True

    def reveal_all_mines(self):
        for x, y in self.mine_positions:
            self.revealed[y][x] = True


class MinesweeperGUI:
    def __init__(self, master: tk.Tk):
        self.master = master
        self.master.title("Minesweeper")

        self.difficulty_levels = {
            "Beginner": (9, 9, 10),
            "Intermediate": (16, 16, 40),
            "Expert": (30, 16, 99)
        }

        self.current_difficulty = "Beginner"
        self.create_menu()
        self.new_game()

    def create_menu(self):
        menubar = tk.Menu(self.master)
        self.master.config(menu=menubar)

        game_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Game", menu=game_menu)
        game_menu.add_command(label="New Game", command=self.new_game)
        game_menu.add_separator()

        for difficulty in self.difficulty_levels:
            game_menu.add_radiobutton(
                label=difficulty,
                command=lambda d=difficulty: self.set_difficulty(d)
            )

        game_menu.add_separator()
        game_menu.add_command(label="Exit", command=self.master.quit)

    def set_difficulty(self, difficulty: str):
        self.current_difficulty = difficulty
        self.new_game()

    def new_game(self):
        width, height, mines = self.difficulty_levels[self.current_difficulty]
        self.game = Minesweeper(width, height, mines)

        if hasattr(self, 'frame'):
            self.frame.destroy()

        self.frame = tk.Frame(self.master)
        self.frame.pack()

        self.info_frame = tk.Frame(self.frame)
        self.info_frame.grid(row=0, column=0, columnspan=self.game.width)

        self.mine_label = tk.Label(self.info_frame, text=f"Mines: {self.game.mines}", font=("Arial", 12))
        self.mine_label.pack(side=tk.LEFT, padx=10)

        self.reset_button = tk.Button(self.info_frame, text="🙂", font=("Arial", 20), command=self.new_game)
        self.reset_button.pack(side=tk.LEFT, padx=10)

        self.flags_label = tk.Label(self.info_frame, text=f"Flags: 0", font=("Arial", 12))
        self.flags_label.pack(side=tk.LEFT, padx=10)

        self.buttons = []
        for y in range(self.game.height):
            row = []
            for x in range(self.game.width):
                btn = tk.Button(
                    self.frame,
                    width=2,
                    height=1,
                    font=("Arial", 10, "bold"),
                    bg="lightgray",
                    command=lambda x=x, y=y: self.on_click(x, y)
                )
                btn.grid(row=y+1, column=x)
                btn.bind("<Button-3>", lambda event, x=x, y=y: self.on_right_click(x, y))
                row.append(btn)
            self.buttons.append(row)

    def on_click(self, x: int, y: int):
        revealed = self.game.reveal(x, y)

        for rx, ry in revealed:
            self.update_button(rx, ry)

        if self.game.game_over:
            self.game.reveal_all_mines()
            for my in range(self.game.height):
                for mx in range(self.game.width):
                    self.update_button(mx, my)
            self.reset_button.config(text="😵")
            messagebox.showinfo("Game Over", "You hit a mine!")
        elif self.game.game_won:
            self.reset_button.config(text="😎")
            messagebox.showinfo("Congratulations", "You won!")

    def on_right_click(self, x: int, y: int):
        self.game.toggle_flag(x, y)
        self.update_button(x, y)
        self.update_flag_count()

    def update_button(self, x: int, y: int):
        btn = self.buttons[y][x]

        if self.game.flagged[y][x]:
            btn.config(text="🚩", bg="lightgray")
        elif self.game.revealed[y][x]:
            value = self.game.board[y][x]
            if value == -1:
                btn.config(text="💣", bg="red")
            elif value == 0:
                btn.config(text="", bg="white", relief=tk.SUNKEN)
            else:
                colors = ["", "blue", "green", "red", "darkblue", "brown", "cyan", "black", "gray"]
                btn.config(text=str(value), bg="white", fg=colors[value], relief=tk.SUNKEN)
        else:
            btn.config(text="", bg="lightgray", relief=tk.RAISED)

    def update_flag_count(self):
        flag_count = sum(row.count(True) for row in self.game.flagged)
        self.flags_label.config(text=f"Flags: {flag_count}")


if __name__ == "__main__":
    root = tk.Tk()
    root.resizable(False, False)
    app = MinesweeperGUI(root)
    root.mainloop()