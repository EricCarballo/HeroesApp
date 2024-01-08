import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { HeroesService } from '../../services/heroes.service';
import { Hero, Publisher } from '../../interfaces/hero.interface';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id: new FormControl(''),
    superhero: new FormControl('', { nonNullable: true }),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl(''),
  });

  public publisers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];

  constructor(
    private heroServices: HeroesService,
    private actiatedRoute: ActivatedRoute,
    private router: Router,
    private snakcbar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  get CurrentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero
  }

  ngOnInit(): void {

    if (!this.router.url.includes('edit')) return;

    this.actiatedRoute.params
      .pipe(
        switchMap(({ id }) => this.heroServices.getHeroById(id)),
      ).subscribe(hero => {
        if (!hero) return this.router.navigateByUrl('/')

        this.heroForm.reset(hero)
        return

      })

  }

  onSumbit(): void {

    if (this.heroForm.invalid) {
      this.snakcbar.open('¡Algunos Campos son Inválidos!', 'okey', {
        duration: 2500,
      })
      return;
    }


    // SI SE DESEA EDITAR UN HEROE
    if (this.CurrentHero.id) {
      this.heroServices.updateHero(this.CurrentHero)
        .subscribe(hero => {
          //TODO: mostrar snackbar
          this.router.navigate(['/'])
          this.showSnackBar(`${hero.superhero} actualizado`)
        });
      return;
    }

    // SI SE DESEA CREAR UN HEROE
    this.heroServices.addHero(this.CurrentHero)
      .subscribe(hero => {
        //TODO: mostrar snackbar
        this.router.navigate(['/'])
        this.showSnackBar(`${hero.superhero} creado`)
      })

  }

  onDeleteHero(): void {

    if (!this.CurrentHero.id) throw Error('Hero id is required')

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value,
    });

    dialogRef.afterClosed()
      .pipe(
        filter( (result: boolean) => result ),
        switchMap( () => this.heroServices.deleteHeroById( this.CurrentHero.id )),
        filter( (wasDeleted: boolean) => wasDeleted ),
      )
    .subscribe( () => {
      this.router.navigate(['/'])
    })

    // dialogRef.afterClosed().subscribe(result => {
    //   if ( !result ) return

    //   this.heroServices.deleteHeroById( this.CurrentHero.id )
    //     .subscribe( wasDeleted => {
    //       this.router.navigate(['/'])
    //     })

    // });

  }

  showSnackBar(message: string): void {
    this.snakcbar.open(message, 'done', {
      duration: 2500,
    })
  }

}
