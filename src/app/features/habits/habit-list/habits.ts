import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../../core/services/habit.service';
import { CategoryService } from '../../../core/services/category.service';
import { HABIT_TYPES, FREQUENCY_TYPES, Habit, Category } from '../../../core/models/habit.models';
import { AppIconComponent } from '../../../core/components/app-icon';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './habits.html',
  styleUrl: './habits.css'
})
export class HabitsComponent implements OnInit {

  @ViewChild('formDialog') formDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('deleteDialog') deleteDialog!: ElementRef<HTMLDialogElement>;

  habits: Habit[] = [];
  categories: Category[] = [];
  types = [...HABIT_TYPES];
  frequencies = [...FREQUENCY_TYPES];

  editingId: number | null = null;
  formName = '';
  formCategoryId = 0;
  formTypeId = 1;
  formPointsPerUnit = 1;
  formFrequencyType = 1;
  formTargetCount = 1;
  deleteTarget: Habit | null = null;
  saveLoading = false;

  constructor(
    private habitService: HabitService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadHabits();
  }

  get typeLabel(): (id: number) => string {
    return (id: number) => this.types.find(t => t.id === id)?.name ?? `Type ${id}`;
  }

  get pointsPerUnitLabel(): string {
    switch (this.formTypeId) {
      case 1:
        return 'Points per hour';
      case 2:
        return 'Points when done';
      case 3:
        return 'Points per unit';
      default:
        return 'Points per unit';
    }
  }

  formatFrequency(habit: Habit): string {
    const target = habit.targetcount ?? 1;
    switch (habit.frequencytype) {
      case 2:
        return `${target}×/week`;
      case 3:
        return `${target}×/month`;
      default:
        return `${target}×/day`;
    }
  }

  formatPointsRate(habit: Habit): string {
    const rate = habit.pointsperunit ?? 1;
    switch (habit.typeid) {
      case 1:
        return `${rate} pts/hr`;
      case 2:
        return `${rate} pts when done`;
      case 3:
        return `${rate} pts/unit`;
      default:
        return `${rate} pts`;
    }
  }

  openAdd(): void {
    this.editingId = null;
    this.formName = '';
    this.formTypeId = 1;
    this.formPointsPerUnit = 1;
    this.formFrequencyType = 1;
    this.formTargetCount = 1;
    if (this.categories.length > 0) {
      this.formCategoryId = this.categories[0].id;
    }
    this.formDialog.nativeElement.showModal();
  }

  openEdit(habit: Habit): void {
    this.editingId = habit.id;
    this.formName = habit.name;
    this.formCategoryId = habit.categoryid;
    this.formTypeId = habit.typeid;
    this.formPointsPerUnit = habit.pointsperunit ?? 1;
    this.formFrequencyType = habit.frequencytype ?? 1;
    this.formTargetCount = habit.targetcount ?? 1;
    this.formDialog.nativeElement.showModal();
  }

  closeForm(): void {
    this.formDialog.nativeElement.close();
  }

  saveHabit(): void {
    this.saveLoading = true;
    if (!this.formName.trim()) return;

    const obs = this.editingId
      ? this.habitService.updateHabit({
          id: this.editingId,
          name: this.formName.trim(),
          categoryId: this.formCategoryId,
          typeId: this.formTypeId,
          pointsPerUnit: this.formPointsPerUnit,
          frequencyType: this.formFrequencyType,
          targetCount: this.formTargetCount
        })
      : this.habitService.createHabit({
          name: this.formName.trim(),
          categoryId: this.formCategoryId,
          typeId: this.formTypeId,
          pointsPerUnit: this.formPointsPerUnit,
          frequencyType: this.formFrequencyType,
          targetCount: this.formTargetCount
        });

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadHabits();
        this.saveLoading = false;
      },
      error: (error) => {
          console.log(error);
          this.saveLoading = false;
        }
    });
  }

  openDeleteConfirm(habit: Habit): void {
    this.deleteTarget = habit;
    this.deleteDialog.nativeElement.showModal();
  }

  closeDelete(): void {
    this.deleteDialog.nativeElement.close();
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;

    this.habitService.softDeleteHabit(this.deleteTarget.id).subscribe({
      next: () => {
        this.closeDelete();
        this.loadHabits();
      }
    });
  }

  loadHabits(): void {
    this.habitService.getHabits().subscribe({
      next: (response) => {
        this.habits = response;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response;
        if (this.categories.length > 0 && !this.formCategoryId) {
          this.formCategoryId = this.categories[0].id;
        }
      }
    });
  }
}
