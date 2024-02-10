import { Component } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Employee } from '../_models/employee.interface';
import { EmployeeDisplay } from '../_models/employeeToDisplay.interface';
import { group } from '@angular/animations';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  employees: Employee[] = [];
  employeesToDisplay: EmployeeDisplay[] = [];


  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void 
  {
    this.employeeService.getEmployees().subscribe((employees) => {
      this.employees = employees;

      this.employees.forEach(element => {
        if(this.employeesToDisplay.length > 0)
        {
          let found = false;
          for (let i = 0; i < this.employeesToDisplay.length; i++) 
          {
            
            if (element.EmployeeName === this.employeesToDisplay[i].EmployeeName) 
            {
              this.employeesToDisplay[i].TotalTimeHrs += this.calculateHours(element.StarTimeUtc, element.EndTimeUtc);
              found = true;
            }
            else
            {
              continue;
            }
          }
          if (!found)
          {
            let emp = {
              EmployeeName: element.EmployeeName,
              TotalTimeHrs: this.calculateHours(element.StarTimeUtc, element.EndTimeUtc)
            }
            this.employeesToDisplay.push(emp);
          }
        }else
        {
          let emp = {
            EmployeeName: element.EmployeeName,
            TotalTimeHrs: this.calculateHours(element.StarTimeUtc, element.EndTimeUtc)
          }
          this.employeesToDisplay.push(emp);
        }
      });

      this.employeesToDisplay.sort((a, b) => b.TotalTimeHrs - a.TotalTimeHrs);
    })
  }


  calculateHours(startTime:string, endTime:string) : number
  {
    const diffInMs = Date.parse(endTime) - Date.parse(startTime);
    const diffInHours = diffInMs / 1000 / 60 / 60;
    return diffInHours;
  }
}
