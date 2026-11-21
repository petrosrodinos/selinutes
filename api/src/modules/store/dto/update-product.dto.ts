import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsBoolean, IsUUID } from 'class-validator'
import { CreateProductDto, toArray } from './create-product.dto'

const toBoolean = ({ value }: { value: unknown }): unknown => (value === 'true' ? true : value === 'false' ? false : value)

export class UpdateProductDto extends CreateProductDto {
    @ApiPropertyOptional({ type: [String], description: 'UUIDs of existing product files to remove' })
    @Transform(toArray)
    @IsArray()
    @IsUUID('all', { each: true })
    remove_file_uuids: string[] = []

    @ApiPropertyOptional({ type: [String], description: 'UUIDs of existing product files that are shown as previews in the store (all others are hidden)' })
    @Transform(toArray)
    @IsArray()
    @IsUUID('all', { each: true })
    preview_file_uuids: string[] = []

    @ApiPropertyOptional({ description: 'Remove the current cover image (ignored when a new image is uploaded)' })
    @Transform(toBoolean)
    @IsBoolean()
    remove_image: boolean = false
}
