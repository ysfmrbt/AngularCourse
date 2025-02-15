import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MemberService } from 'src/services/member.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css'],
})
export class MemberFormComponent implements OnInit {
  constructor(
    private ms: MemberService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  form!: FormGroup;
  // Récuperer la route actif
  // Si le id existe et a une valeur, on récupère le membre correspondant
  // Sinon, on crée un nouveau membre
  ngOnInit() {
    this.form = new FormGroup({
      cin: new FormControl(null),
      nom: new FormControl(null),
      type: new FormControl(null),
      createDate: new FormControl(null),
    });
    // Route actif
    const currentId = this.activatedRoute.snapshot.params['id'];
    if (currentId) {
      this.ms.getMemberById(currentId).subscribe((data) => {
        console.log(data);
        this.form = new FormGroup({
          cin: new FormControl(data.cin),
          nom: new FormControl(data.name),
          type: new FormControl(data.type),
          createDate: new FormControl(data.createDate),
        });
      });
    } else {
      this.form = new FormGroup({
        cin: new FormControl(null),
        nom: new FormControl(null),
        type: new FormControl(null),
        createDate: new FormControl(null),
      });
    }
  }

  sub() {
    console.log(this.form.value);
    this.ms.addMember(this.form.value);
    this.router.navigate(['/members']);
  }
}
