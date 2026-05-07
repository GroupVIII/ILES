# placements/admin.py
from django.contrib import admin
from .models import Department, Placement, PlacementHistory, Rotation


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'head', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'code', 'description')


class PlacementHistoryInline(admin.TabularInline):
    model = PlacementHistory
    extra = 0
    readonly_fields = ('changed_at',)


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = ('intern', 'department', 'title', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'department', 'start_date')
    search_fields = ('intern__email', 'intern__first_name', 'intern__last_name', 'title')
    filter_horizontal = ('supervisors',)
    inlines = [PlacementHistoryInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Rotation)
class RotationAdmin(admin.ModelAdmin):
    list_display = ('intern', 'from_department', 'to_department', 'rotation_date')
    list_filter = ('rotation_date',)
    search_fields = ('intern__email', 'reason')