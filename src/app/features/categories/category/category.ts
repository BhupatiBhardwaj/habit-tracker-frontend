import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/habit.models';
import { AppIconComponent } from '../../../core/components/app-icon';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, CommonModule, AppIconComponent],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class CategoriesComponent implements OnInit {

  @ViewChild('formDialog') formDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('deleteDialog') deleteDialog!: ElementRef<HTMLDialogElement>;

  categories: Category[] = [];
  editingId: number | null = null;
  formName = '';
  deleteTarget: Category | null = null;
  deleteError = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  openAdd(): void {
    this.editingId = null;
    this.formName = '';
    this.formDialog.nativeElement.showModal();
  }

  openEdit(category: Category): void {
    this.editingId = category.id;
    this.formName = category.name;
    this.formDialog.nativeElement.showModal();
  }

  closeForm(): void {
    this.formDialog.nativeElement.close();
  }

  saveCategory(): void {
    if (!this.formName.trim()) return;

    const obs = this.editingId
      ? this.categoryService.updateCategory({ id: this.editingId, name: this.formName.trim() })
      : this.categoryService.createCategory({ name: this.formName.trim() });

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadCategories();
      }
    });
  }

  openDeleteConfirm(category: Category): void {
    this.deleteTarget = category;
    this.deleteError = '';
    this.deleteDialog.nativeElement.showModal();
  }

  closeDelete(): void {
    this.deleteDialog.nativeElement.close();
    this.deleteTarget = null;
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;

    this.categoryService.deleteCategory(this.deleteTarget.id).subscribe({
      next: () => {
        this.closeDelete();
        this.loadCategories();
      },
      error: (err) => {
        this.deleteError = err?.error?.message ?? 'Could not delete category';
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response;
      }
    });
  }
}
