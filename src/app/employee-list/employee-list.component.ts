import { Component } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Employee } from '../_models/employee.interface';
import { EmployeeDisplay } from '../_models/employeeToDisplay.interface';
import {Chart, registerables} from 'chart.js/auto';

Chart.register(...registerables);

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  employees: Employee[] = [];
  employeesToDisplay: EmployeeDisplay[] = [];
  chart: any = [];


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

      var options = {
        tooltips: {
          enabled: false
        },
        plugins: {
          datalabels: {
            formatter: (value: number, ctx: { chart: { data: { datasets: { data: any; }[]; }; }; }) => {
              const datapoints = ctx.chart.data.datasets[0].data
               const total = datapoints.reduce((total: any, datapoint: any) => total + datapoint, 0)
              const percentage = value / total * 100
              return percentage.toFixed(2) + "%";
            },
            color: '#fff',
          }
        }
      };
      
      this.chart = new Chart('canvas', 
      {
        type: 'pie',
        data: {
          labels: this.employeesToDisplay.map(names => names.EmployeeName),
          datasets: [
            {
              data: this.employeesToDisplay.map(hours => hours.TotalTimeHrs),
              borderWidth: 1,
            },
          ], 
        },
        options: {
          plugins: {
            legend : {
              position : 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context){
                  var data = context.dataset.data,
                      label = context.label,
                      currentValue : any = context.raw,
                      total = 0;
        
                  for( var i = 0; i < data.length; i++ ){
                    total += data[i];
                  }
                  var percentage = parseFloat(( currentValue /total*100).toFixed(1));
        
                  return ' (' + percentage + '%)';
                }
              },
            },
            // labels: {
            //   render: 'percentage',
            //   precision: 2
            // }
          },
        },
      });
    })
  }


  calculateHours(startTime:string, endTime:string) : number
  {
    const diffInMs = Date.parse(endTime) - Date.parse(startTime);
    const diffInHours = diffInMs / 1000 / 60 / 60;
    return diffInHours;
  }
}
